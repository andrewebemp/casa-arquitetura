# DecorAI Brasil — Development Workflow & Deployment

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Sections:** 13-14

---

## 13. Development Workflow

### 13.1 Prerequisites

```bash
# Required tools
node --version    # >= 20.0.0
pnpm --version    # >= 8.0.0
python --version  # >= 3.11
docker --version  # Para Supabase local

# Install pnpm (if not installed)
npm install -g pnpm
```

### 13.2 Initial Setup

```bash
# Clone repository
git clone https://github.com/decorai/decorai.git
cd decorai

# Install all dependencies (monorepo)
pnpm install

# Setup Supabase local
npx supabase init
npx supabase start
npx supabase db push  # Apply migrations

# Setup Python pipeline
cd packages/ai-pipeline
python -m venv .venv
source .venv/bin/activate  # ou .venv/Scripts/activate no Windows
pip install -r requirements.txt
cd ../..

# Copy env template
cp .env.example .env.local
# Edit .env.local with your keys
```

### 13.3 Development Commands

```bash
# Start all services (frontend + backend)
pnpm dev

# Start frontend only (Next.js)
pnpm --filter web dev

# Start backend only (Fastify)
pnpm --filter api dev

# Start AI pipeline (Python)
cd packages/ai-pipeline && uvicorn src.main:app --reload

# Run tests (all packages)
pnpm test

# Run tests (specific package)
pnpm --filter web test
pnpm --filter api test

# Lint all
pnpm lint

# Type check all
pnpm typecheck

# Build all
pnpm build
```

### 13.4 Environment Configuration

```bash
# packages/web/.env.local (Frontend)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:3001/v1

# packages/api/.env (Backend)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
REDIS_URL=redis://localhost:6379
AI_PIPELINE_URL=http://localhost:8000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ASAAS_API_KEY=<asaas-sandbox-key>
ANTHROPIC_API_KEY=sk-ant-...

# packages/ai-pipeline/.env (Python)
FAL_KEY=<fal-api-key>
REPLICATE_API_TOKEN=<replicate-token>
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

---

## 14. Deployment Architecture

### 14.1 Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm --filter web build`
- **Output Directory:** `packages/web/.next`
- **CDN/Edge:** Vercel Edge Network + Cloudflare (imagens)
- **Region:** GRU (Sao Paulo)

**Backend Deployment:**
- **Platform:** Railway
- **Build Command:** `pnpm --filter api build`
- **Deployment Method:** Dockerfile ou Nixpacks auto-detect
- **Region:** South America (GRU)
- **Scaling:** Horizontal auto-scale (2-8 instances)

**AI Pipeline Deployment:**
- **Platform:** Railway (FastAPI server) + fal.ai/Replicate (GPU)
- **Build Command:** `docker build -t ai-pipeline .`
- **Deployment Method:** Docker container
- **GPU Workers:** Managed by fal.ai/Replicate (serverless GPU)

### 14.2 Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|-------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3001 | Local development |
| Staging | https://staging.decorai.com.br | https://api-staging.decorai.com.br | Pre-production testing |
| Production | https://decorai.com.br | https://api.decorai.com.br | Live environment |

### 14.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  deploy-staging:
    needs: lint-test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: lint-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```
