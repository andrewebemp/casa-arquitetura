#!/bin/bash
set -e

FUNC_DIR=".vercel/output/functions/api/index.func"

# Clean previous output
rm -rf .vercel/output

# Bundle API with esbuild
# External: sharp (native bindings), bullmq (uses worker_threads that break when bundled)
npx esbuild api/_entry.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --minify \
  --outfile="$FUNC_DIR/index.js" \
  --external:sharp \
  --external:bullmq \
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

# Install external modules directly into function's node_modules
# This is more reliable than copying from pnpm store since it resolves all transitive deps
mkdir -p "$FUNC_DIR"
cd "$FUNC_DIR"
npm init -y > /dev/null 2>&1
npm install --production sharp@0.33.5 bullmq@5.70.4 2>&1 | tail -5
rm -f package.json package-lock.json
cd - > /dev/null

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
