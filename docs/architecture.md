# DecorAI Brasil — Architecture Index

**Versao:** 1.1
**Data:** 2026-03-09
**Status:** Active

---

## Architecture Documents

Este projeto utiliza documentacao de arquitetura **fragmentada (sharded)**. Os documentos originais foram decompostos em partes menores para facilitar navegacao e carregamento por agentes de IA.

### Primary — Fullstack Architecture (19 shards)

Documento original: [fullstack-architecture.md](architecture/fullstack-architecture.md) (thin index)
Shards detalhados: [fullstack/index.md](architecture/fullstack/index.md)

| Shard | Content |
|-------|---------|
| [high-level.md](architecture/fullstack/high-level.md) | Intro, High Level Architecture, Patterns |
| [tech-stack.md](architecture/fullstack/tech-stack.md) | 40+ technologies with rationale |
| [data-models.md](architecture/fullstack/data-models.md) | 9 entities, TypeScript interfaces, ER diagram |
| [api-spec.md](architecture/fullstack/api-spec.md) | 42 REST endpoints, request/response examples |
| [components.md](architecture/fullstack/components.md) | Frontend + Backend + AI Pipeline components |
| [external-apis.md](architecture/fullstack/external-apis.md) | Claude, fal.ai, Replicate, Stripe, Asaas, Supabase |
| [workflows.md](architecture/fullstack/workflows.md) | 4 core workflow sequence diagrams |
| [database-schema.md](architecture/fullstack/database-schema.md) | PostgreSQL DDL, RLS, triggers |
| [frontend-arch.md](architecture/fullstack/frontend-arch.md) | Component org, state, routing, services |
| [backend-arch.md](architecture/fullstack/backend-arch.md) | Service arch, DB access, auth middleware |
| [project-structure.md](architecture/fullstack/project-structure.md) | Monorepo directory tree |
| [devops.md](architecture/fullstack/devops.md) | Dev workflow, deployment, CI/CD |
| [security-performance.md](architecture/fullstack/security-performance.md) | Security, LGPD, performance |
| [testing.md](architecture/fullstack/testing.md) | Testing pyramid, coding standards |
| [error-handling.md](architecture/fullstack/error-handling.md) | Error flow, response format |
| [monitoring.md](architecture/fullstack/monitoring.md) | Monitoring stack, metrics, alerts |
| [squad-mapping.md](architecture/fullstack/squad-mapping.md) | Agent-to-module, agent-to-NFR |
| [cost-estimate.md](architecture/fullstack/cost-estimate.md) | Infrastructure cost MVP |

### Primary — Technical Architecture

| Document | Path | Content |
|----------|------|---------|
| Technical Architecture | [technical-architecture.md](architecture/technical-architecture.md) | Architectural Patterns, Infrastructure, Deployment, Monitoring |

### Complementary — UX/UI Spec (11 shards)

Documento original: [ux-ui-spec.md](architecture/ux-ui-spec.md) (thin index)
Shards detalhados: [ux-ui/index.md](architecture/ux-ui/index.md)

| Shard | Content |
|-------|---------|
| [personas.md](architecture/ux-ui/personas.md) | Carlos, Marina, Roberto |
| [information-architecture.md](architecture/ux-ui/information-architecture.md) | Site map, navigation |
| [user-flows.md](architecture/ux-ui/user-flows.md) | 6 user flows |
| [wireframes.md](architecture/ux-ui/wireframes.md) | ASCII wireframes all pages |
| [component-library.md](architecture/ux-ui/component-library.md) | Atomic Design system |
| [branding.md](architecture/ux-ui/branding.md) | Colors, typography, spacing |
| [accessibility.md](architecture/ux-ui/accessibility.md) | WCAG AA requirements |
| [responsiveness.md](architecture/ux-ui/responsiveness.md) | Mobile-first strategy |
| [animations.md](architecture/ux-ui/animations.md) | Micro-interactions |
| [performance.md](architecture/ux-ui/performance.md) | Performance, states, traceability |

### Other Inputs

| Document | Path | Content |
|----------|------|---------|
| PRD | [prd.md](prd.md) (thin index) / [prd/index.md](prd/index.md) (12 shards) | Requirements (FR/NFR), Business Rules |
| Project Brief | [project-brief.md](project-brief.md) | Vision, Goals, Constraints |
| Front-End Spec | [front-end-spec.md](front-end-spec.md) | Component Architecture, State Management, Routing |

### Data Layer

| Document | Path | Content |
|----------|------|---------|
| Domain Model | [data/domain-model.md](data/domain-model.md) | Bounded contexts, aggregates, relationships |
| Index Strategy | [data/index-strategy.md](data/index-strategy.md) | 12 custom indexes, access patterns |
| Migration Plan | [data/migration-plan.md](data/migration-plan.md) | Migration order, rollback procedures |

---

## Key Decisions for Data Layer

Extracted from architecture docs for quick reference:

- **Database:** PostgreSQL via Supabase (Auth + RLS + Storage + Realtime)
- **Cache:** Redis via Upstash (sessions, queues, semantic cache)
- **Queue:** BullMQ (Redis-backed job queue for GPU renders)
- **Storage:** Supabase Storage (S3-compatible) + Cloudflare CDN
- **Auth:** Supabase Auth (Google OAuth + email/password, PKCE flow)
- **Payments:** Stripe (international) + Asaas (Brasil: PIX, boleto, cartao)
- **Realtime:** Supabase Realtime (WebSocket channels per project)
