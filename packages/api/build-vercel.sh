#!/bin/bash
set -e

FUNC_DIR=".vercel/output/functions/api/index.func"

# Clean previous output
rm -rf .vercel/output

# Bundle API with esbuild (only sharp is external - has native bindings)
npx esbuild api/_entry.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --outfile="$FUNC_DIR/index.js" \
  --external:sharp \
  "--alias:@decorai/shared=../shared/src/index.ts"

# Create .vc-config.json for the serverless function
cat > "$FUNC_DIR/.vc-config.json" << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs"
}
EOF

# Copy sharp native module
mkdir -p "$FUNC_DIR/node_modules"
if [ -d "node_modules/sharp" ]; then
  cp -rL "node_modules/sharp" "$FUNC_DIR/node_modules/sharp"
elif [ -d "../../node_modules/sharp" ]; then
  cp -rL "../../node_modules/sharp" "$FUNC_DIR/node_modules/sharp"
fi

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
