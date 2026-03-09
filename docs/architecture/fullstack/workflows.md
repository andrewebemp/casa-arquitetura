# DecorAI Brasil — Core Workflows

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 8

---

## 8. Core Workflows

### 8.1 Workflow 1 — Geracao de Render (Time-to-Value < 3 min)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as Web (Next.js)
    participant A as API (Fastify)
    participant Q as BullMQ (Redis)
    participant AI as AI Pipeline (FastAPI)
    participant GPU as fal.ai/Replicate
    participant S as Supabase (DB+Storage)
    participant RT as Realtime (WebSocket)

    U->>W: Upload foto + seleciona estilo
    W->>A: POST /projects (create)
    A->>S: INSERT project
    W->>A: POST /projects/:id/upload (multipart)
    A->>S: Upload to Storage
    A->>AI: POST /analyze (photo)
    Note over AI: spatial-analyst: ZoeDepth + interpretacao
    AI-->>A: Dados espaciais + croqui ASCII
    A-->>W: Croqui para revisao (FR-29)

    U->>W: Aprova croqui
    W->>A: POST /projects/:id/croqui/approve
    A->>Q: Enqueue render job (priority by tier)
    A->>RT: Broadcast "generating" status

    Q->>AI: Process job
    Note over AI: staging-architect pipeline:
    Note over AI: 1. Depth conditioning (ZoeDepth)
    Note over AI: 2. Style prompt (CLIP + IP-Adapter)
    Note over AI: 3. ControlNet multi-conditioning
    Note over AI: 4. SDXL generation
    AI->>GPU: Inference request
    GPU-->>AI: Generated image
    Note over AI: 5. Upscale (Real-ESRGAN)
    Note over AI: 6. Quality validation (FID, SSIM)
    AI->>S: Upload final image to Storage
    AI-->>A: Job completed + image URL

    A->>S: INSERT project_version
    A->>RT: Broadcast "ready" + image URL
    RT-->>W: WebSocket update
    W-->>U: Render exibido no canvas!
```

**Ref:** FR-01, FR-02, FR-21, FR-22, FR-29, FR-31, NFR-01, NFR-03, NFR-16

### 8.2 Workflow 2 — Chat de Refinamento

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as Web (ChatPanel)
    participant A as API (ChatModule)
    participant CL as Claude API
    participant Q as BullMQ
    participant AI as AI Pipeline
    participant S as Supabase
    participant RT as Realtime

    U->>W: "tira o tapete e muda o piso para madeira"
    W->>A: POST /projects/:id/chat

    A->>CL: Interpret command (PT-BR NLU)
    Note over CL: conversational-designer: NCF patterns
    CL-->>A: Operations extracted
    Note over A: [remove:tapete, change:piso→madeira]

    A->>S: INSERT chat_message (with operations)
    A->>Q: Enqueue refinement job
    A->>RT: Broadcast "refining" + typing indicator
    A-->>W: 202 Accepted (operations preview)

    Q->>AI: Process refinement
    Note over AI: staging-architect:
    Note over AI: 1. SAM segmenta tapete + piso
    Note over AI: 2. LaMa inpaints tapete
    Note over AI: 3. ControlNet re-gera piso
    AI->>S: Upload new version
    AI-->>A: Refinement completed

    A->>S: INSERT project_version (v+1)
    A->>S: UPDATE chat_message.version_id
    A->>RT: Broadcast "ready" + new version
    RT-->>W: Canvas update (crossfade 300ms)
    W-->>U: Nova versao com alteracoes aplicadas
```

**Ref:** FR-04, FR-05, FR-06, FR-27, FR-28, NFR-02

### 8.3 Workflow 3 — Reverse Staging (Funil Freemium)

```mermaid
sequenceDiagram
    actor U as Visitante
    participant W as Web (/diagnostico)
    participant A as API (DiagnosticModule)
    participant AI as AI Pipeline
    participant S as Supabase

    U->>W: Acessa /diagnostico (sem login)
    U->>W: Upload foto do anuncio
    W->>A: POST /diagnostics (multipart)

    A->>AI: Analyze photo (diagnostico)
    Note over AI: proptech-growth: analise de staging
    Note over AI: Identifica: vazio, iluminacao, composicao
    AI->>S: Upload staged preview
    AI-->>A: Analysis results

    A->>S: INSERT diagnostic
    A-->>W: Resultado do diagnostico

    W-->>U: Split view: original | staging preview
    W-->>U: "Seu imovel perde ~30% de valor"
    W-->>U: CTA: "Decorar este imovel — GRATIS"

    U->>W: Clica CTA
    W->>W: Redirect /login (foto pre-carregada)
    Note over W: Cookie salva diagnostic_id por 7 dias
```

**Ref:** FR-12, FR-13

### 8.4 Workflow 4 — Autenticacao

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as Web (/login)
    participant SB as Supabase Auth
    participant A as API (Fastify)
    participant DB as PostgreSQL

    alt Google OAuth
        U->>W: Click "Entrar com Google"
        W->>SB: signInWithOAuth('google')
        SB-->>W: Redirect to Google
        U->>SB: Authorize
        SB-->>W: JWT token (cookie)
    else Email/Password
        U->>W: Email + password
        W->>SB: signInWithPassword()
        SB-->>W: JWT token (cookie)
    end

    W->>A: GET /auth/me (Bearer JWT)
    A->>SB: Validate JWT
    SB-->>A: User data
    A->>DB: SELECT user_profile (RLS by user_id)

    alt Primeiro login
        A->>DB: INSERT user_profile
        A->>DB: INSERT subscription (tier: free)
        A-->>W: Profile + onboarding flag
    else Login existente
        A-->>W: Profile + subscription data
    end
```

**Ref:** FR-14, NFR-08
