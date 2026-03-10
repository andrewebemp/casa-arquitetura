#!/bin/bash
set -e

# Bundle API with esbuild for Vercel serverless deployment
npx esbuild api/index.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --outfile=api/index.js \
  --external:sharp \
  --external:ioredis \
  --external:bullmq \
  --external:pino \
  --external:pino-pretty \
  "--alias:@decorai/shared=../shared/src/index.ts"

# Create public dir with placeholder for Vercel output requirement
mkdir -p public
echo '{"status":"api"}' > public/index.json

echo "API bundled successfully for Vercel"
