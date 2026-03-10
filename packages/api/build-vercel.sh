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

# Copy external native/complex modules from pnpm store
mkdir -p "$FUNC_DIR/node_modules"

copy_from_pnpm() {
  local name=$1
  local src=$(find ../../node_modules/.pnpm -maxdepth 3 -type d -name "$name" 2>/dev/null | grep "node_modules/$name$" | head -1)
  if [ -n "$src" ]; then
    cp -rL "$src" "$FUNC_DIR/node_modules/$name"
    echo "Copied $name from $src"
  else
    echo "WARNING: $name not found in pnpm store"
  fi
}

copy_from_pnpm "sharp"
copy_from_pnpm "bullmq"

# bullmq needs these peer/transitive dependencies at runtime
for dep in cron-parser glob lodash msgpackr; do
  copy_from_pnpm "$dep"
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
