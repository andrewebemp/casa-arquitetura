# DecorAI Brasil — External APIs

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 7

---

## 7. External APIs

### 7.1 Claude API (Anthropic)

- **Purpose:** Interpretacao de comandos em PT-BR via NLU, visao computacional para analise de fotos
- **Documentation:** https://docs.anthropic.com/
- **Base URL:** https://api.anthropic.com/v1
- **Authentication:** API key (Bearer token)
- **Rate Limits:** Tier-dependent, ~1000 RPM para production
- **Key Endpoints Used:**
  - `POST /messages` — Interpretar comando de chat, analisar foto, gerar descricao de croqui
- **Integration Notes:** Usar claude-sonnet para NLU (custo otimizado) e claude-sonnet com vision para analise de fotos. Fallback para GPT-4o se Claude indisponivel.

**Ref:** FR-04, FR-06, FR-28, FR-32

### 7.2 fal.ai

- **Purpose:** GPU compute gerenciado para inferencia SDXL + ControlNet
- **Documentation:** https://fal.ai/docs
- **Base URL:** https://fal.run
- **Authentication:** API key
- **Rate Limits:** Pay-per-request, sem limite hard
- **Key Endpoints Used:**
  - `POST /fal-ai/fast-sdxl` — Geracao SDXL com ControlNet
  - `POST /fal-ai/real-esrgan` — Upscale de imagens
- **Integration Notes:** Provider primario por latencia (< 10s cold start). Suporta queue async com webhook de completion. Pricing: ~$0.01-0.05/inference.

**Ref:** FR-21, CON-06, NFR-01

### 7.3 Replicate

- **Purpose:** GPU compute alternativo e fallback para fal.ai
- **Documentation:** https://replicate.com/docs
- **Base URL:** https://api.replicate.com/v1
- **Authentication:** API token
- **Rate Limits:** Pay-per-second, sem limite hard
- **Key Endpoints Used:**
  - `POST /predictions` — Criar predicao (SDXL, SAM, ZoeDepth, etc.)
  - `GET /predictions/:id` — Status da predicao
- **Integration Notes:** Fallback quando fal.ai indisponivel. Melhor para modelos custom (fine-tuned). Pricing por segundo de GPU.

**Ref:** FR-21, CON-06

### 7.4 Stripe

- **Purpose:** Pagamentos internacionais, subscriptions, checkout
- **Documentation:** https://docs.stripe.com/
- **Base URL:** https://api.stripe.com/v1
- **Authentication:** Secret key + webhook signing
- **Rate Limits:** 100 read/s, 100 write/s
- **Key Endpoints Used:**
  - `POST /checkout/sessions` — Criar sessao de checkout
  - `POST /billing_portal/sessions` — Portal de gerenciamento
  - `POST /webhooks` — Eventos de subscription
- **Integration Notes:** Usar Stripe Checkout (hosted page) para simplificar PCI compliance. Webhooks para sincronizar status de subscription.

**Ref:** FR-18

### 7.5 Asaas

- **Purpose:** Gateway de pagamento brasileiro — PIX, boleto, cartao em BRL
- **Documentation:** https://docs.asaas.com/
- **Base URL:** https://api.asaas.com/v3
- **Authentication:** API key
- **Rate Limits:** 5 requests/s
- **Key Endpoints Used:**
  - `POST /customers` — Criar cliente
  - `POST /subscriptions` — Criar assinatura
  - `POST /webhooks` — Eventos de pagamento
- **Integration Notes:** Preferir para clientes brasileiros (PIX = conversao imediata). Webhooks para sincronizar status. Sandbox disponivel para testes.

**Ref:** FR-18

### 7.6 Supabase

- **Purpose:** PostgreSQL gerenciado, Auth, Storage (S3-compatible), Realtime (WebSocket)
- **Documentation:** https://supabase.com/docs
- **Base URL:** https://<project>.supabase.co
- **Authentication:** Service role key (backend), anon key (frontend)
- **Rate Limits:** Plan-dependent (Pro: 500 concurrent connections)
- **Key Endpoints Used:**
  - Auth API — sign up, sign in, OAuth
  - REST API — CRUD via PostgREST
  - Storage API — upload, download, signed URLs
  - Realtime — channels, broadcast
- **Integration Notes:** RLS policies OBRIGATORIAS para LGPD. Storage com signed URLs (1h expiry). Realtime channels por project_id para progress broadcast.

**Ref:** FR-14, NFR-08, NFR-11, NFR-16
