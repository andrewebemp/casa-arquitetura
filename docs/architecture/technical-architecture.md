# Arquitetura Tecnica — DecorAI Brasil

**Versao:** 1.0
**Data:** 2026-03-09
**Autora:** Aria (@architect)
**Status:** Draft
**Baseado em:** [PRD v1.2](../prd.md), [Project Brief v1.0](../project-brief.md), [UX/UI Spec v1.0](ux-ui-spec.md), [Front-End Spec v1.0](../front-end-spec.md)

---

## 1. Visao Geral da Arquitetura

### 1.1 Estilo Arquitetural

**Monolito Modular** com separacao clara de dominos em packages independentes, evoluindo para microservicos quando necessario.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Monorepo (Turborepo)                         │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  packages/    │  │  packages/   │  │  packages/   │  │packages/│ │
│  │  web          │  │  api         │  │  ai-pipeline │  │ shared  │ │
│  │  (Next.js)    │  │  (Node.js)   │  │  (Python)    │  │ (types) │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │
│         │                  │                  │               │      │
└─────────┼──────────────────┼──────────────────┼───────────────┼──────┘
          │                  │                  │               │
          ▼                  ▼                  ▼               ▼
     Browser/CDN        REST API          GPU Workers     Types/Utils
```

**Ref:** CON-07 (monorepo Turborepo)

### 1.2 Decisoes Arquiteturais Chave

| Decisao | Escolha | Rationale | Ref |
|---------|---------|-----------|-----|
| Monorepo | Turborepo | Shared types, build paralelo, equipe enxuta | CON-07 |
| Frontend | Next.js + TypeScript | SSR para SEO (landing), SPA para app | NFR-12, NFR-13 |
| Backend | Node.js (REST) | Consistencia com frontend, equipe full-stack | CON-02 |
| AI Pipeline | Python (FastAPI) | Ecossistema ML, libs nativas (torch, diffusers) | FR-21 |
| Database | PostgreSQL (Supabase) | Auth integrado, RLS, realtime, storage | FR-14, NFR-08 |
| Cache | Redis | Sessoes, filas, cache semantico | NFR-07 |
| Storage | S3-compatible (Supabase Storage) | CDN integrado, politicas de acesso | NFR-11 |
| GPU Compute | Managed (fal.ai / Replicate) | Sem ops overhead, pay-per-use | CON-06 |
| Payments | Stripe + Asaas | Internacional + brasileiro | FR-18 |
| Realtime | WebSocket (Supabase Realtime) | Progress de geracao | NFR-16 |

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Browser)                              │
│                                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────────────────┐ │
│  │  Landing  │  │   Wizard     │  │  Workspace │  │  Dashboard/Profile   │ │
│  │  Page     │  │  (5 Steps)   │  │  (Editor)  │  │  Billing             │ │
│  └──────────┘  └──────────────┘  └────────────┘  └───────────────────────┘ │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ HTTPS + WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Node.js)                            │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth Module  │  │  Project     │  │  Render      │  │  Billing      │  │
│  │  (Supabase)   │  │  Module      │  │  Module      │  │  Module       │  │
│  │               │  │  (CRUD)      │  │  (Queue)     │  │  (Stripe/     │  │
│  │  FR-14        │  │  FR-15       │  │  FR-19       │  │   Asaas)      │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  │  FR-16,17,18  │  │
│                                              │          └───────────────┘  │
└──────────────────────────────────────────────┼────────────────────────────┘
                                               │ Job Queue (Redis/BullMQ)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI PIPELINE (Python/FastAPI)                       │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Spatial      │  │  Generation  │  │  Refinement  │  │  Quality      │  │
│  │  Analysis     │  │  Engine      │  │  Engine      │  │  Validator    │  │
│  │               │  │              │  │              │  │               │  │
│  │  ZoeDepth     │  │  SDXL +      │  │  SAM 2 +    │  │  FID, SSIM,   │  │
│  │  Depth Any.   │  │  ControlNet  │  │  LaMa +     │  │  LPIPS, CLIP  │  │
│  │               │  │  IC-Light    │  │  IC-Light    │  │               │  │
│  │  FR-32,22     │  │  FR-01,21    │  │  FR-05,07-09│  │  FR-20        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────────┘  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐                                        │
│  │  Style        │  │  LLM         │                                        │
│  │  Interpreter  │  │  Interpreter │                                        │
│  │               │  │              │                                        │
│  │  CLIP +       │  │  Claude API  │                                        │
│  │  IP-Adapter   │  │  (PT-BR NLU) │                                        │
│  │               │  │              │                                        │
│  │  FR-02,23     │  │  FR-04,06    │                                        │
│  └──────────────┘  └──────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    ▼                                    ▼
          ┌──────────────────┐                ┌──────────────────┐
          │  GPU Compute     │                │  Object Storage  │
          │  (fal.ai /       │                │  (Supabase       │
          │   Replicate)     │                │   Storage / S3)  │
          │                  │                │                  │
          │  NFR-01, CON-06  │                │  NFR-11          │
          └──────────────────┘                └──────────────────┘
```

---

## 3. Stack Tecnologica Detalhada

### 3.1 Frontend (packages/web)

| Tecnologia | Uso | Ref |
|-----------|-----|-----|
| Next.js 14+ (App Router) | Framework React com SSR/SSG | NFR-12 |
| TypeScript | Type safety | — |
| Tailwind CSS | Utility-first styling | — |
| Zustand | State management (leve, simples) | — |
| React Query (TanStack) | Server state, cache, mutations | — |
| Supabase Realtime (client) | WebSocket para progress de render | NFR-16 |
| Framer Motion | Animacoes e microinteracoes | UX §9 |
| Lucide React | Icones | UX §5.1 |

### 3.2 Backend (packages/api)

| Tecnologia | Uso | Ref |
|-----------|-----|-----|
| Node.js 20+ | Runtime | — |
| Fastify | HTTP server | — |
| Supabase JS | Auth, DB, Storage, Realtime | FR-14, NFR-08 |
| BullMQ | Job queue para renders | FR-19, NFR-06 |
| Redis (Upstash) | Cache, sessoes, filas | NFR-07 |
| Zod | Validacao de schemas | — |
| Pino | Logging estruturado (JSON, alta performance) | — |

### 3.3 AI Pipeline (packages/ai-pipeline)

| Tecnologia | Uso | Ref |
|-----------|-----|-----|
| Python 3.11+ | Runtime ML | — |
| FastAPI | API HTTP para workers | — |
| Stable Diffusion XL | Geracao de imagens | FR-21 |
| ControlNet | Multi-conditioning (depth, edge, normal) | FR-21 |
| ZoeDepth / Depth Anything V2 | Estimacao de profundidade | FR-22, FR-32 |
| CLIP | Extracao e matching de estilos | FR-23 |
| SAM 2 | Segmentacao de elementos | FR-07 |
| LaMa / Inpaint-Anything | Remocao de objetos | FR-09 |
| IC-Light | Correcao de iluminacao | FR-08 |
| Real-ESRGAN | Upscale para HD (2048x2048) | FR-20 |
| IP-Adapter | Style transfer por referencia | FR-02 |
| Claude API (Anthropic) | Interpretacao de comandos PT-BR | FR-06 |

### 3.4 Infraestrutura

| Tecnologia | Uso | Ref |
|-----------|-----|-----|
| Vercel | Deploy frontend (Next.js) | — |
| Railway / Render | Deploy backend (Node.js) | — |
| fal.ai / Replicate | GPU compute (managed) | CON-06 |
| Supabase (hosted) | PostgreSQL + Auth + Storage + Realtime | — |
| Upstash | Redis serverless | NFR-07 |
| Cloudflare | CDN para imagens | NFR-11 |
| GitHub Actions | CI/CD | — |

---

## 4. Modulos e Dominios

### 4.1 Mapa de Modulos

```
┌─────────────────────────────────────────────────────────────────┐
│                        MODULOS DO SISTEMA                       │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  AUTH            │  │  PROJECTS       │  │  RENDER         │ │
│  │  - Login/Signup  │  │  - CRUD         │  │  - Queue        │ │
│  │  - OAuth Google  │  │  - Versions     │  │  - Pipeline     │ │
│  │  - Session       │  │  - Favorites    │  │  - Cache        │ │
│  │  - LGPD consent  │  │  - History      │  │  - Progress     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  SPATIAL         │  │  CHAT           │  │  BILLING        │ │
│  │  - Depth estim.  │  │  - NLU (Claude) │  │  - Tiers        │ │
│  │  - Photo interp. │  │  - Command map  │  │  - Stripe       │ │
│  │  - Croqui ASCII  │  │  - Version ctrl │  │  - Asaas        │ │
│  │  - Validation    │  │  - Spec fidelity│  │  - Watermark    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  STYLE           │  │  EDITING        │  │  SHARING        │ │
│  │  - 10 presets    │  │  - Segmentation │  │  - Before/After │ │
│  │  - CLIP matching │  │  - Inpainting   │  │  - Public links │ │
│  │  - Prompt gen    │  │  - Lighting     │  │  - Social share │ │
│  │  - BR materials  │  │  - Upscale HD   │  │  - WhatsApp     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  DIAGNOSTICO     │  │  QUALITY        │                      │
│  │  - Reverse stag. │  │  - FID/SSIM     │                      │
│  │  - Loss estimate │  │  - Auto-bench   │                      │
│  │  - Funnel CTA    │  │  - Depth QA     │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Mapeamento Squad DecorAI — Agentes x Modulos Tecnicos

Esta secao conecta cada agente do squad DecorAI aos modulos tecnicos, tecnologias e responsabilidades arquiteturais.

### 5.1 Pipeline de Execucao

```
Input do Usuario
      │
      ▼
┌─────────────────────┐
│  spatial-analyst     │  Tier 0 — Pre-processamento
│  (Fei-Fei Li +      │
│   Saining Xie)      │  Modulos: SPATIAL
│                      │  Tech: ZoeDepth, Depth Anything V2
│  Interpreta foto,    │  FRs: FR-24, FR-25, FR-26, FR-29-32
│  extrai dimensoes,   │
│  gera croqui ASCII   │
└──────────┬──────────┘
           │ croqui aprovado (QG-DA-002)
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  staging-architect   │◄────│  interior-strategist │
│  (Lvmin Zhang +      │     │  (Gilberto Rangel + │
│   Junming Chen)      │     │   Miriam Gurgel)    │
│                      │     │                      │
│  Modulos: RENDER,    │     │  Modulos: STYLE      │
│   EDITING            │     │  Tech: CLIP,         │
│  Tech: SDXL,         │     │   IP-Adapter         │
│   ControlNet, SAM,   │     │  FRs: FR-02          │
│   LaMa, IC-Light,    │     │                      │
│   Real-ESRGAN        │     │  Fornece paleta de   │
│  FRs: FR-01,03,07-09,│     │  estilos brasileiros │
│   FR-20-23           │     │  e prompts otimizados│
└──────────┬──────────┘     └─────────────────────┘
           │ render gerado (QG-DA-003)
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  visual-quality-eng  │     │  pipeline-optimizer  │
│  (Ben Mildenhall +   │     │  (GPU Infrastructure │
│   Shuzhe Wang)       │     │   Expert)            │
│                      │     │                      │
│  Modulos: QUALITY    │     │  Modulos: RENDER     │
│  Tech: FID, SSIM,    │     │   (infra layer)      │
│   LPIPS, CLIP Score  │     │  Tech: fal.ai,       │
│  FR: FR-20           │     │   Replicate, Redis   │
│                      │     │  NFRs: NFR-01,02,    │
│  Valida qualidade    │     │   04,05,06,07        │
│  antes da entrega    │     │                      │
└──────────┬──────────┘     │  Otimiza custo,      │
           │                 │  latencia e cache    │
           ▼                 └─────────────────────┘
┌─────────────────────┐
│  conversational-     │
│  designer            │
│  (Robert J. Moore +  │
│   Erika Hall)        │  Tier 2 — Refinamento
│                      │
│  Modulos: CHAT       │
│  Tech: Claude API,   │
│   WebSocket          │
│  FRs: FR-04,05,06,   │
│   FR-27,28           │
│                      │
│  Loop de refinamento │
│  NLU PT-BR → re-gen  │──────► staging-architect (re-render)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  proptech-growth     │
│  (Pete Flint +       │
│   Mike DelPrete)     │  Tier 2 — Growth & Monetizacao
│                      │
│  Modulos: DIAGNOSTICO│
│   BILLING            │
│  Tech: Analytics,    │
│   Stripe, Asaas      │
│  FRs: FR-12,13,16    │
│                      │
│  Reverse staging     │
│  funnel + pricing    │
└─────────────────────┘
```

### 5.2 Matriz Agente x Modulo Tecnico

| Agente | Modulos Tecnicos | Package(s) | Tecnologias Primarias |
|--------|-----------------|------------|----------------------|
| **decorai-chief** | Todos (orquestracao) | api, ai-pipeline | BullMQ, Event-driven |
| **spatial-analyst** | SPATIAL | ai-pipeline | ZoeDepth, Depth Anything V2, Claude Vision |
| **staging-architect** | RENDER, EDITING | ai-pipeline | SDXL, ControlNet, SAM 2, LaMa, IC-Light, Real-ESRGAN |
| **interior-strategist** | STYLE | ai-pipeline, shared | CLIP, IP-Adapter, brazilian-styles-kb |
| **conversational-designer** | CHAT | api, ai-pipeline | Claude API, WebSocket, BullMQ |
| **proptech-growth** | DIAGNOSTICO, BILLING | api, web | Stripe, Asaas, Analytics |
| **visual-quality-engineer** | QUALITY | ai-pipeline | FID, SSIM, LPIPS, CLIP Score |
| **pipeline-optimizer** | RENDER (infra) | ai-pipeline, api | fal.ai, Replicate, Redis, BullMQ |

### 5.3 Matriz Agente x NFRs

| Agente | NFRs Impactados | Contribuicao |
|--------|-----------------|-------------|
| spatial-analyst | NFR-03 | Reduz time-to-value com croqui rapido |
| staging-architect | NFR-01, NFR-15 | Latencia < 30s, qualidade perceptual > 4.0 |
| interior-strategist | NFR-14, NFR-15 | Interface 100% PT-BR, estilos brasileiros |
| conversational-designer | NFR-02, NFR-14 | Chat < 15s, interpretacao PT-BR |
| proptech-growth | NFR-04 | Custo por render < R$ 2,00 |
| visual-quality-engineer | NFR-15 | Satisfacao > 4.0/5.0 |
| pipeline-optimizer | NFR-01, NFR-04, NFR-05, NFR-06, NFR-07 | Performance, escala, custo, cache |

### 5.4 Consulta por Epic de Desenvolvimento

| Epic | Agentes DecorAI a Consultar | Entregaveis Esperados |
|------|---------------------------|----------------------|
| **Epic 1 — Geracao & Staging** | spatial-analyst, staging-architect, interior-strategist | Pipeline de input multi-formato, croqui ASCII, geracao SDXL+ControlNet, 10 estilos BR |
| **Epic 2 — Chat Refinamento** | conversational-designer, staging-architect | NLU PT-BR, mapeamento comando→operacao, re-render parcial, versionamento |
| **Epic 3 — Edicao Granular** | staging-architect, visual-quality-engineer | Segmentacao SAM, inpainting LaMa, iluminacao IC-Light, upscale |
| **Epic 4 — Compartilhamento** | decorai-chief | Slider antes/depois, paginas publicas, deep links |
| **Epic 5 — Reverse Staging** | proptech-growth | Diagnostico AI, estimativa de perda, funil freemium |
| **Epic 6 — Auth & Billing** | proptech-growth | Tiers Free/Pro/Business, Stripe + Asaas, watermark |
| **Epic 7 — Pipeline Infra** | pipeline-optimizer, staging-architect, visual-quality-engineer | Fila async, WebSocket progress, cache semantico, GPU routing, quality gates |

---

## 6. Fluxo de Dados

### 6.1 Fluxo Principal — Geracao de Render

```
1. Usuario faz upload/descricao
   │
   ▼
2. [API] Valida input, cria projeto no PostgreSQL
   │
   ▼
3. [API] Enfileira job no BullMQ (Redis)
   │  spatial-analyst valida e gera croqui
   │
   ▼
4. [WebSocket] Envia croqui ASCII para usuario
   │  Usuario aprova (QG-DA-002)
   │
   ▼
5. [AI Pipeline] Processa na GPU (fal.ai):
   │  a. Depth estimation (ZoeDepth)      ← spatial-analyst
   │  b. Style prompt generation (CLIP)    ← interior-strategist
   │  c. ControlNet conditioning           ← staging-architect
   │  d. SDXL generation                   ← staging-architect
   │  e. Post-processing (upscale, light)  ← staging-architect
   │  f. Quality validation (FID, SSIM)    ← visual-quality-engineer
   │
   ▼
6. [API] Salva imagem no Supabase Storage
   │
   ▼
7. [WebSocket] Notifica frontend — render disponivel
   │
   ▼
8. [Frontend] Exibe no canvas do workspace
```

### 6.2 Fluxo de Refinamento via Chat

```
1. Usuario digita: "tira o tapete e muda o piso"
   │
   ▼
2. [API] Envia para Claude API (NLU)
   │  conversational-designer interpreta
   │
   ▼
3. [Claude] Retorna operacoes estruturadas:
   │  { "remove": ["tapete"], "change": {"piso": "madeira clara"} }
   │
   ▼
4. [AI Pipeline] Executa operacoes parciais:
   │  a. SAM segmenta tapete e piso        ← staging-architect
   │  b. LaMa inpaints tapete removido     ← staging-architect
   │  c. ControlNet re-gera piso           ← staging-architect
   │
   ▼
5. [API] Cria nova versao no PostgreSQL (FR-27)
   │
   ▼
6. [WebSocket] Atualiza canvas + historico de versoes
```

---

## 7. Modelo de Dados (Visao Alto Nivel)

```sql
-- Usuarios e autenticacao (Supabase Auth)
-- Gerenciado pelo Supabase, nao precisa de tabela customizada

-- Projetos
projects (
  id UUID PK,
  user_id UUID FK → auth.users,
  name TEXT,
  input_type ENUM ('photo', 'text', 'combined'),
  style TEXT,
  status ENUM ('draft', 'generating', 'ready', 'error'),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Versoes de render (historico)
project_versions (
  id UUID PK,
  project_id UUID FK → projects,
  version_number INTEGER,
  image_url TEXT,
  thumbnail_url TEXT,
  original_image_url TEXT,
  prompt TEXT,
  refinement_command TEXT,  -- comando do chat que gerou esta versao
  metadata JSONB,           -- depth maps, conditioning params, quality scores
  created_at TIMESTAMPTZ
)

-- Inputs espaciais (medidas, croqui)
spatial_inputs (
  id UUID PK,
  project_id UUID FK → projects,
  input_data JSONB,         -- { width, length, height, openings, items }
  croqui_ascii TEXT,        -- croqui gerado
  croqui_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- Mensagens do chat
chat_messages (
  id UUID PK,
  project_id UUID FK → projects,
  role ENUM ('user', 'assistant'),
  content TEXT,
  operations JSONB,         -- operacoes extraidas pelo LLM
  version_id UUID FK → project_versions,  -- versao gerada por esta msg
  created_at TIMESTAMPTZ
)

-- Assinaturas e billing
subscriptions (
  id UUID PK,
  user_id UUID FK → auth.users,
  tier ENUM ('free', 'pro', 'business'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  asaas_customer_id TEXT,
  renders_used INTEGER DEFAULT 0,
  renders_limit INTEGER,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  status ENUM ('active', 'canceled', 'past_due')
)

-- Diagnosticos (reverse staging)
diagnostics (
  id UUID PK,
  original_image_url TEXT,
  staged_image_url TEXT,
  analysis JSONB,           -- { issues, estimated_loss_pct, recommendations }
  user_id UUID FK → auth.users NULL,  -- pode ser anonimo
  created_at TIMESTAMPTZ
)

-- Render jobs (fila)
render_jobs (
  id UUID PK,
  project_id UUID FK → projects,
  type ENUM ('initial', 'refinement', 'style_change', 'diagnostic'),
  status ENUM ('queued', 'processing', 'completed', 'failed'),
  priority INTEGER DEFAULT 0,
  input_params JSONB,
  output_params JSONB,
  gpu_provider TEXT,        -- 'fal', 'replicate', etc.
  cost_cents INTEGER,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

**Nota:** Schema detalhado deve ser definido por @data-engineer (delegacao de @architect conforme responsibility_boundaries).

---

## 8. Seguranca

### 8.1 Camadas de Protecao

| Camada | Mecanismo | Ref |
|--------|-----------|-----|
| Autenticacao | Supabase Auth (Google OAuth + email/password) | FR-14 |
| Autorizacao | Row Level Security (RLS) no PostgreSQL | NFR-08 |
| Rate Limiting | Por tier: Free (3/mes), Pro (ilimitado), Business (ilimitado) | NFR-10 |
| Input Validation | Zod schemas em todas as rotas da API | — |
| File Upload | Validacao de tipo MIME, tamanho max 20MB, scanning | FR-01 |
| LGPD | Consentimento explicito, opt-in para treinamento, direito ao esquecimento | NFR-08, NFR-09 |
| Storage | Buckets privados com signed URLs (expiraveis) | NFR-11 |
| API Keys | Rotacao automatica, env vars, sem hardcode | — |

### 8.2 Fluxo de Autenticacao

```
[Login Page] → [Supabase Auth] → [JWT Token] → [API com Bearer Token]
                                       │
                                       ▼
                              [RLS filtra dados por user_id]
```

---

## 9. Performance e Cache

### 9.1 Estrategia de Cache

| Tipo | Tecnologia | TTL | Uso |
|------|-----------|-----|-----|
| Cache semantico de renders | Redis (hash de input params) | 24h | Evitar re-render identico |
| Sessoes de usuario | Redis | 7d | Auth tokens |
| CDN de imagens | Cloudflare | 30d | Servir imagens geradas |
| API responses | React Query (client) | 5min | Dados de projetos |

### 9.2 Metas de Performance

| Metrica | Target | Agente Responsavel | Ref |
|---------|--------|-------------------|-----|
| Render inicial | < 30s | pipeline-optimizer | NFR-01 |
| Refinamento chat | < 15s | pipeline-optimizer | NFR-02 |
| Time-to-value | < 3min | spatial-analyst | NFR-03 |
| Custo por render | < R$ 2,00 | pipeline-optimizer | NFR-04 |
| Capacidade MVP | 2.000 renders/mes | pipeline-optimizer | NFR-05 |

---

## 10. Observabilidade

### 10.1 Logging

- **Structured logging** com Pino (JSON format, alta performance)
- Niveis: error, warn, info, debug
- Contexto obrigatorio: user_id, project_id, job_id, duration_ms

### 10.2 Metricas

| Metrica | Tipo | Fonte |
|---------|------|-------|
| render_duration_ms | Histogram | ai-pipeline |
| render_cost_cents | Counter | ai-pipeline |
| queue_depth | Gauge | BullMQ |
| active_users | Gauge | Supabase Auth |
| quality_score (FID/SSIM) | Histogram | visual-quality-engineer |
| chat_commands_processed | Counter | api |

### 10.3 Alertas

| Condicao | Severidade | Acao |
|---------|-----------|------|
| render_duration > 60s | Warning | Notificar time |
| render_failure_rate > 5% | Critical | Investigar pipeline |
| queue_depth > 100 | Warning | Scale up workers |
| GPU provider down | Critical | Failover para provider alternativo |

---

## 11. Deploy e CI/CD

### 11.1 Ambientes

| Ambiente | Uso | Deploy |
|----------|-----|--------|
| Development | Local dev | docker-compose |
| Staging | Testes pre-prod | Push para branch staging |
| Production | Usuarios finais | Push para main (via @devops) |

### 11.2 Pipeline CI/CD

```
[Push to branch] → [GitHub Actions]
                          │
                    ┌─────┼──────┐
                    ▼     ▼      ▼
                 [Lint] [Test] [Typecheck]
                    │     │      │
                    └─────┼──────┘
                          │ (all pass)
                          ▼
                   [Build packages]
                          │
                    ┌─────┼──────┐
                    ▼     ▼      ▼
               [Vercel] [Railway] [fal.ai]
               (web)    (api)    (ai-pipeline)
```

---

## 12. Riscos Arquiteturais e Mitigacoes

| Risco | Severidade | Mitigacao | Agente Relacionado |
|-------|-----------|-----------|-------------------|
| Qualidade insuficiente dos renders | Alta | Fine-tuning dataset, FID benchmarking, beta feedback | visual-quality-engineer |
| Custos GPU inviaveis | Alta | Cache semantico, SDXL Turbo, spot pricing, autoscaling | pipeline-optimizer |
| Latencia > 30s | Media | Pipeline otimizado, conditioning pre-computado | pipeline-optimizer |
| Vendor lock-in (GPU) | Media | Abstraction layer sobre fal.ai/Replicate/Modal | pipeline-optimizer |
| Claude API instavel | Baixa | Fallback para GPT-4o, retry com exponential backoff | conversational-designer |
| Supabase rate limits | Baixa | Connection pooling, query optimization | — |

---

## 13. Checklist de Arquitetura

- [x] Stack tecnologica definida e rastreavel para requisitos (§3)
- [x] Diagrama de componentes com separacao de responsabilidades (§2)
- [x] Modulos de dominio mapeados (§4)
- [x] Squad DecorAI mapeado para modulos e tecnologias (§5)
- [x] Fluxos de dados documentados (§6)
- [x] Modelo de dados de alto nivel (§7)
- [x] Seguranca em camadas (§8)
- [x] Estrategia de cache e performance (§9)
- [x] Observabilidade e alertas (§10)
- [x] CI/CD e deploy (§11)
- [x] Riscos e mitigacoes (§12)

---

*— Aria (@architect), arquitetando o futuro*
