# DecorAI Brasil — Squad DecorAI Mapping

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 20

---

## 20. Squad DecorAI Mapping

### 20.1 Agent-to-Module Mapping

| Agent | Modulos Tecnicos | Package(s) | Tecnologias Primarias | Pipeline Tier |
|-------|-----------------|------------|----------------------|---------------|
| **decorai-chief** | Todos (orquestracao) | api, ai-pipeline | BullMQ, Event-driven | Orquestrador |
| **spatial-analyst** | SPATIAL (SpatialAnalysisService) | ai-pipeline | ZoeDepth, Depth Anything V2, Claude Vision | Tier 0 — Pre-processamento |
| **staging-architect** | RENDER (GenerationEngine), EDITING (RefinementEngine) | ai-pipeline | SDXL, ControlNet, SAM 2, LaMa, IC-Light, Real-ESRGAN | Tier 1 — Geracao |
| **interior-strategist** | STYLE (StyleInterpreter) | ai-pipeline, shared | CLIP, IP-Adapter, brazilian-styles-kb | Tier 1 — Suporte |
| **conversational-designer** | CHAT (LLMInterpreter, ChatModule) | api, ai-pipeline | Claude API, WebSocket, NCF patterns | Tier 2 — Refinamento |
| **proptech-growth** | DIAGNOSTICO (DiagnosticModule), BILLING (BillingModule) | api, web | Stripe, Asaas, Analytics | Tier 2 — Growth |
| **visual-quality-engineer** | QUALITY (QualityValidator) | ai-pipeline | FID, SSIM, LPIPS, CLIP Score | Gate — Validacao |
| **pipeline-optimizer** | RENDER infra (GPU routing, cache) | ai-pipeline, api | fal.ai, Replicate, Redis, BullMQ, autoscaling | Cross — Infra |

### 20.2 Agent-to-NFR Matrix

| Agente | NFRs Impactados | Contribuicao Especifica |
|--------|-----------------|------------------------|
| **spatial-analyst** | NFR-03 | Reduz time-to-value com croqui rapido (< 5s) |
| **staging-architect** | NFR-01, NFR-15 | Latencia de render < 30s, qualidade perceptual > 4.0/5.0 |
| **interior-strategist** | NFR-14, NFR-15 | Interface 100% PT-BR, 10 estilos de decoracao brasileiros |
| **conversational-designer** | NFR-02, NFR-14 | Chat refinamento < 15s, interpretacao PT-BR nativa |
| **proptech-growth** | NFR-04, NFR-08 | Custo por render < R$ 2.00, LGPD compliance no billing |
| **visual-quality-engineer** | NFR-15, NFR-17 | Satisfacao > 4.0/5.0, disclaimer IA automatico |
| **pipeline-optimizer** | NFR-01, NFR-04, NFR-05, NFR-06, NFR-07 | Performance, custo, escala 2K→50K renders, cache semantico |

### 20.3 Consultation by Epic

| Epic | Agentes DecorAI a Consultar | Entregaveis Esperados |
|------|---------------------------|----------------------|
| **Epic 1 — Geracao & Staging** | spatial-analyst, staging-architect, interior-strategist | Pipeline de input multi-formato, croqui ASCII 3-turn, geracao SDXL+ControlNet, 10 estilos BR, upscale HD |
| **Epic 2 — Chat Refinamento** | conversational-designer, staging-architect | NLU PT-BR com NCF patterns, mapeamento comando→operacao, re-render parcial SAM+LaMa, versionamento ilimitado |
| **Epic 3 — Edicao Granular** | staging-architect, visual-quality-engineer | Segmentacao SAM por elemento, inpainting LaMa, correcao IC-Light, upscale Real-ESRGAN, quality gate |
| **Epic 4 — Compartilhamento** | decorai-chief | Slider antes/depois, paginas publicas com disclaimer, deep links WhatsApp/Instagram |
| **Epic 5 — Reverse Staging** | proptech-growth | Diagnostico AI com score, estimativa de perda em R$, preview de staging, funil freemium com CTA |
| **Epic 6 — Auth & Billing** | proptech-growth | Tiers Free(3)/Pro(100)/Business(500), Stripe + Asaas, watermark automatico, LGPD consent |
| **Epic 7 — Pipeline Infra** | pipeline-optimizer, staging-architect, visual-quality-engineer | Fila BullMQ async, WebSocket progress, cache semantico Redis, GPU routing fal.ai/Replicate, quality gates FID/SSIM/LPIPS |
