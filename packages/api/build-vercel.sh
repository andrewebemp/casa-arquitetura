#!/bin/bash
set -e

FUNC_DIR=".vercel/output/functions/api/index.func"

# Clean previous output
rm -rf .vercel/output

# Bundle API with esbuild
# Keep native/complex modules external to avoid bundling issues
npx esbuild api/_entry.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --minify \
  --outfile="$FUNC_DIR/index.js" \
  --external:sharp \
  --external:ioredis \
  --external:bullmq \
  --external:pino \
  --external:pino-pretty \
  "--alias:@decorai/shared=../shared/src/index.ts"

# Create .vc-config.json for the serverless function
cat > "$FUNC_DIR/.vc-config.json" << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "maxDuration": 60,
  "memory": 1024
}
EOF

# Copy external node_modules needed at runtime
# pnpm uses symlinks, so we need to follow them (-L)
mkdir -p "$FUNC_DIR/node_modules"
MODULES="../../node_modules"

echo "Copying external modules..."
for pkg in sharp ioredis bullmq pino pino-pretty; do
  if [ -e "$MODULES/$pkg" ]; then
    cp -rL "$MODULES/$pkg" "$FUNC_DIR/node_modules/$pkg" 2>/dev/null && echo "  + $pkg" || true
  fi
done

# Copy common transitive deps needed by ioredis/bullmq/pino
for pkg in denque cluster-key-slot standard-as-callback redis-errors redis-parser \
           sonic-boom fast-redact atomic-sleep on-exit-leak-free thread-stream \
           real-require pino-abstract-transport safe-stable-stringify quick-format-unescaped \
           msgpackr msgpackr-extract cron-parser semver lodash; do
  if [ -e "$MODULES/$pkg" ]; then
    cp -rL "$MODULES/$pkg" "$FUNC_DIR/node_modules/$pkg" 2>/dev/null || true
  fi
done

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
du -sh "$FUNC_DIR/node_modules" 2>/dev/null || echo "No node_modules"
