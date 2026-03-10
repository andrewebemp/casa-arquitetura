#!/bin/bash
set -e

FUNC_DIR=".vercel/output/functions/api/index.func"

# Clean previous output
rm -rf .vercel/output

# Create a lightweight bullmq shim that provides Queue without worker_threads
# The serverless API only needs Queue for enqueuing jobs, not Worker
mkdir -p /tmp/bullmq-shim
cat > /tmp/bullmq-shim/index.js << 'SHIMEOF'
// Lightweight bullmq shim for serverless — only provides Queue class
// Worker and other classes that use worker_threads are stubbed out
const { EventEmitter } = require('events');

class Queue extends EventEmitter {
  constructor(name, opts) {
    super();
    this.name = name;
    this.opts = opts;
    this._connection = opts?.connection;
  }
  async add(name, data, opts) {
    // Use ioredis directly to add job to BullMQ-compatible queue
    const conn = this._connection;
    if (!conn) throw new Error('Queue: no connection');
    // Lazy connect if needed
    if (conn.status === 'wait') await conn.connect();
    const jobId = opts?.jobId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const job = {
      id: jobId,
      name,
      data: JSON.stringify(data),
      opts: JSON.stringify(opts || {}),
      timestamp: Date.now(),
      delay: 0,
      priority: opts?.priority || 0,
      attempts: opts?.attempts || (this.opts?.defaultJobOptions?.attempts || 3),
      processedOn: 0,
      finishedOn: 0,
    };
    // Add to BullMQ queue format in Redis
    const key = `bull:${this.name}`;
    const pipeline = conn.multi();
    pipeline.hset(`${key}:${jobId}`, job);
    if (opts?.priority) {
      pipeline.zadd(`${key}:priority`, opts.priority, jobId);
    } else {
      pipeline.rpush(`${key}:wait`, jobId);
    }
    pipeline.hset(`${key}:meta`, 'count', '1');
    await pipeline.exec();
    return { id: jobId, name, data };
  }
  async getJob(jobId) {
    const conn = this._connection;
    if (!conn) return null;
    if (conn.status === 'wait') await conn.connect();
    const key = `bull:${this.name}:${jobId}`;
    const data = await conn.hgetall(key);
    if (!data || !data.id) return null;
    return { ...data, remove: async () => conn.del(key) };
  }
  async close() {}
}

class Worker { constructor() { throw new Error('Worker not available in serverless'); } }
class FlowProducer { constructor() { throw new Error('FlowProducer not available in serverless'); } }

module.exports = { Queue, Worker, FlowProducer };
SHIMEOF

# Bundle API with esbuild using the bullmq shim
npx esbuild api/_entry.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --minify \
  --outfile="$FUNC_DIR/index.js" \
  --external:sharp \
  "--alias:bullmq=/tmp/bullmq-shim/index.js" \
  "--alias:@decorai/shared=../shared/src/index.ts"

# Create .vc-config.json for the serverless function
cat > "$FUNC_DIR/.vc-config.json" << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true,
  "maxDuration": 60,
  "memory": 1024
}
EOF

# Copy sharp (native module) from pnpm store
mkdir -p "$FUNC_DIR/node_modules"
SHARP_SRC=$(find ../../node_modules/.pnpm -maxdepth 3 -type d -name "sharp" 2>/dev/null | grep "node_modules/sharp$" | head -1)
if [ -n "$SHARP_SRC" ]; then
  cp -rL "$SHARP_SRC" "$FUNC_DIR/node_modules/sharp"
  echo "Copied sharp from $SHARP_SRC"
else
  echo "WARNING: sharp not found in node_modules"
fi

# Create static output directory
mkdir -p .vercel/output/static

# Create Build Output API v3 config
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api"
    }
  ]
}
EOF

echo "API bundled successfully for Vercel (Build Output API v3)"
ls -lh "$FUNC_DIR/index.js"
