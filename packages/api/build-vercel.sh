#!/bin/bash
set -e

FUNC_DIR=".vercel/output/functions/api/index.func"

# Clean previous output
rm -rf .vercel/output

# Bundle API with esbuild - only sharp is external (native bindings)
# Everything else (ioredis, bullmq, pino, etc.) is bundled inline
npx esbuild api/_entry.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --minify \
  --outfile="$FUNC_DIR/index.js" \
  --external:sharp \
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

# Copy sharp (native module) - find it in pnpm store
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
