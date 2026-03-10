#!/bin/bash
set -e
cd ../..
# Use pnpm to run esbuild from the api package where it's installed
pnpm --filter @decorai/api exec esbuild api/index.ts \
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
echo "API bundled successfully for Vercel"
