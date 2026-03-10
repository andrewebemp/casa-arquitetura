# DecorAI API — Multi-stage Dockerfile
# Build: docker build -t decorai-api -f packages/api/Dockerfile .
# Run from monorepo root context

# ---------- Stage 1: Install + Build ----------
FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./

# Copy package.json for each workspace package
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/api/ packages/api/

# Build shared first, then API
RUN pnpm turbo run build --filter=@decorai/api

# ---------- Stage 2: Production ----------
FROM node:20-slim AS runner

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace root for pnpm resolution
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/shared/package.json packages/shared/
COPY --from=builder /app/packages/api/dist packages/api/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "packages/api/dist/server.js"]
