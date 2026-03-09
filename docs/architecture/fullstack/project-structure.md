# DecorAI Brasil — Unified Project Structure

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 12

---

## 12. Unified Project Structure

```
decorai/
├── .github/
│   └── workflows/
│       ├── ci.yaml                    # Lint + test + typecheck
│       └── deploy.yaml                # Deploy to Vercel/Railway
├── packages/
│   ├── web/                           # Frontend (Next.js 14)
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages
│   │   │   ├── components/            # atoms/molecules/organisms
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── services/              # API client layer
│   │   │   ├── stores/                # Zustand stores
│   │   │   ├── lib/                   # Utils, supabase client
│   │   │   └── types/                 # Re-exports from shared
│   │   ├── public/                    # Static assets, favicon
│   │   ├── tailwind.config.ts         # Design tokens
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── api/                           # Backend (Fastify)
│   │   ├── src/
│   │   │   ├── routes/                # API route handlers
│   │   │   ├── services/              # Business logic
│   │   │   ├── middleware/            # Auth, rate limit, validation
│   │   │   ├── queue/                 # BullMQ render queue + worker
│   │   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── lib/                   # Clients (supabase, redis, stripe)
│   │   │   ├── config/               # Typed env config
│   │   │   └── server.ts             # Entry point
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ai-pipeline/                   # AI Pipeline (Python/FastAPI)
│   │   ├── src/
│   │   │   ├── api/                   # FastAPI routes
│   │   │   ├── services/
│   │   │   │   ├── spatial.py         # ZoeDepth, depth estimation
│   │   │   │   ├── generation.py      # SDXL + ControlNet
│   │   │   │   ├── refinement.py      # SAM, LaMa, IC-Light
│   │   │   │   ├── style.py           # CLIP, IP-Adapter
│   │   │   │   ├── quality.py         # FID, SSIM, LPIPS
│   │   │   │   ├── llm.py            # Claude API interpreter
│   │   │   │   └── croqui.py         # ASCII croqui generator
│   │   │   ├── models/               # ML model loaders
│   │   │   ├── providers/            # fal.ai, Replicate clients
│   │   │   ├── utils/                # Image processing utils
│   │   │   └── main.py               # FastAPI entry
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   └── shared/                        # Shared types & utils
│       ├── src/
│       │   ├── types/                 # TypeScript interfaces
│       │   │   ├── project.ts
│       │   │   ├── user.ts
│       │   │   ├── subscription.ts
│       │   │   ├── chat-message.ts
│       │   │   ├── render-job.ts
│       │   │   ├── spatial-input.ts
│       │   │   ├── diagnostic.ts
│       │   │   └── index.ts
│       │   ├── constants/
│       │   │   ├── styles.ts          # 10 DecorStyle values
│       │   │   ├── tiers.ts           # Tier limits
│       │   │   └── index.ts
│       │   └── utils/
│       │       ├── validators.ts      # Shared validation
│       │       └── formatters.ts      # Date, currency (BRL)
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── migrations/                    # SQL migration files
│   ├── seed.sql                       # Seed data (styles, etc.)
│   └── config.toml                    # Supabase local config
├── docs/
│   ├── prd.md
│   ├── project-brief.md
│   ├── front-end-spec.md
│   └── architecture/
│       ├── ux-ui-spec.md
│       ├── technical-architecture.md
│       └── fullstack-architecture.md
├── .env.example
├── turbo.json
├── package.json                       # Root workspace
├── pnpm-workspace.yaml
└── README.md
```
