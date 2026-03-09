# DecorAI Brasil — Infrastructure Cost Estimate

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 21

---

## 21. Infrastructure Cost Estimate (MVP — 2.000 renders/mes)

| Servico | Custo Mensal Estimado | Ref |
|---------|----------------------|-----|
| Vercel (Pro) | R$ 100 (~$20/mo) | — |
| Railway (API + workers) | R$ 125 (~$25/mo) | — |
| Supabase (Pro) | R$ 125 (~$25/mo) | — |
| Upstash Redis (Pay-as-you-go) | R$ 50 (~$10/mo) | NFR-07 |
| fal.ai / Replicate (GPU) | R$ 3.000–6.000 | CON-01, NFR-04 |
| Cloudflare (Free/Pro) | R$ 0–100 | NFR-11 |
| Claude API (NLU) | R$ 250–500 | FR-06 |
| Stripe (2.9% + R$ 0.30/tx) | Variavel | FR-18 |
| Asaas (1.99% PIX) | Variavel | FR-18 |
| Sentry (Developer) | R$ 0 (free tier) | — |
| **TOTAL (fixo)** | **R$ 3.650–7.000/mes** | **CON-01** |

**Nota:** GPU compute (fal.ai/Replicate) representa ~80% do custo. Meta de R$ 1.50/render medio com cache semantico ativo.

**Ref:** CON-01, CON-06, NFR-04
