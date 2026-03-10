#!/bin/bash
set -e

FUNC_DIR=".vercel/output/functions/api/index.func"

# Clean previous output
rm -rf .vercel/output

# Bundle API with esbuild (minified, only sharp is external)
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

# Copy sharp native module (follows symlinks)
mkdir -p "$FUNC_DIR/node_modules"
for dir in "node_modules/sharp" "../../node_modules/.pnpm/sharp@*/node_modules/sharp" "../../node_modules/sharp"; do
  if ls -d $dir 2>/dev/null | head -1 | xargs test -d 2>/dev/null; then
    SHARP_DIR=$(ls -d $dir 2>/dev/null | head -1)
    cp -rL "$SHARP_DIR" "$FUNC_DIR/node_modules/sharp"
    echo "Copied sharp from $SHARP_DIR"
    break
  fi
done

# Create static output directory (API has no static files)
mkdir -p .vercel/output/static

# Create Build Output API v3 config with catch-all route
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
