# PRD — DecorAI Brasil

**Versao:** 1.2
**Data:** 2026-03-08
**Autor:** Morgan (@pm)
**Status:** Draft
**Baseado em:** [Project Brief v1.0](project-brief.md)

> **PRD fragmentado.** Os detalhes de cada secao estao em arquivos individuais dentro de [`docs/prd/`](prd/index.md).

---

## 1. Visao Geral do Produto

### 1.1 O que e

DecorAI Brasil e uma plataforma web de IA generativa que transforma fotos de espacos vazios em ambientes decorados fotorrealistas, oferecendo um pipeline unificado de virtual staging, edicao de fotos imobiliarias, personalizacao granular de materiais e dialogo iterativo com IA — tudo em portugues brasileiro, com pricing em reais.

> **Ref:** Brief §Executive Summary

### 1.2 Problema

Profissionais do mercado imobiliario brasileiro precisam de 3–5 ferramentas distintas (todas em ingles, cobrando em USD) para produzir material visual de qualidade. Imoveis sem staging profissional recebem 47% menos consultas e perdem 20-30% de valor percebido. Nenhuma ferramenta existente oferece dialogo iterativo com IA para refinamento.

> **Ref:** Brief §Problem Statement

### 1.3 Publico-alvo

| Segmento | Descricao | Tamanho |
|----------|-----------|---------|
| Primario | Corretores de imoveis e imobiliarias | 450.000+ profissionais (CRECI) |
| Secundario | Incorporadoras e construtoras | ~3.000 ativas, ~200K unidades/ano |
| Terciario | Designers de interiores e arquitetos | ~150.000 registrados (CAU + ABD) |

> **Ref:** Brief §Target Users

### 1.4 Proposta de Valor

A unica plataforma all-in-one em portugues que aceita multiplos inputs (foto do local — inclusive em reforma —, descricao com medidas, fotos de referencia de itens) e permite dialogo iterativo com a IA para refinar o resultado respeitando rigorosamente as especificacoes — diferentemente dos concorrentes que funcionam como "caixas pretas" (foto entra, resultado sai).

> **Ref:** Brief §Proposed Solution, Requisito do Usuario

---

## 2. Requisitos Funcionais

Detalhados por epic nos shards:

| Epic | Shard | Requisitos |
|------|-------|------------|
| Epic 1 — Geracao e Staging AI | [epic-1-geracao-staging.md](prd/epic-1-geracao-staging.md) | FR-01 a FR-03, FR-24 a FR-26, FR-29 a FR-32 |
| Epic 2 — Chat Visual de Refinamento | [epic-2-chat-refinamento.md](prd/epic-2-chat-refinamento.md) | FR-04 a FR-06, FR-27, FR-28 |
| Epic 3 — Edicao e Personalizacao | [epic-3-edicao-personalizacao.md](prd/epic-3-edicao-personalizacao.md) | FR-07 a FR-09 |
| Epic 4 — Compartilhamento | [epic-4-compartilhamento.md](prd/epic-4-compartilhamento.md) | FR-10, FR-11 |
| Epic 5 — Reverse Staging | [epic-5-reverse-staging.md](prd/epic-5-reverse-staging.md) | FR-12, FR-13 |
| Epic 6 — Auth e Billing | [epic-6-auth-billing.md](prd/epic-6-auth-billing.md) | FR-14 a FR-18 |
| Epic 7 — Infraestrutura | [epic-7-infraestrutura.md](prd/epic-7-infraestrutura.md) | FR-19 a FR-23 |

---

## 3. Requisitos Nao-Funcionais

Ver [nfr.md](prd/nfr.md) — NFR-01 a NFR-17 (performance, escalabilidade, seguranca, usabilidade, observabilidade).

---

## 4. Restricoes, Premissas e Riscos

Ver [constraints-risks.md](prd/constraints-risks.md) — CON-01 a CON-07, premissas-chave e riscos principais.

---

## 5. Metricas de Sucesso

Ver [metrics.md](prd/metrics.md) — business metrics (90 dias), user metrics e KPIs de escala (12 meses).

---

## 6. Fora do Escopo e Rastreabilidade

Ver [traceability.md](prd/traceability.md) — itens excluidos do MVP e matriz de rastreabilidade Brief -> PRD.

---

## 9. Stack Tecnico (Referencia)

Conforme definido no Brief §Technical Considerations:

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js (React) + TypeScript, SSR para SEO |
| Backend API | Node.js (REST) ou Python (FastAPI) para pipeline IA |
| IA/ML | SDXL + ControlNet, SAM, ZoeDepth, CLIP, LLM (Claude/GPT) |
| Database | PostgreSQL + S3-compatible (imagens) |
| Cache | Redis (sessoes + cache semantico) |
| Infra | Cloud com GPU (AWS/GCP ou Modal/Replicate) |
| Pagamentos | Stripe + gateway BR (Asaas/Pagar.me) |
| Auth | Google OAuth + email/password |
| CDN | CloudFront ou Cloudflare |
| Monorepo | Turborepo (packages: web, api, ai-pipeline, shared) |

---

*-- Morgan (@pm), Product Manager -- Synkra AIOS*
