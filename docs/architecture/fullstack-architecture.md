# DecorAI Brasil — Fullstack Architecture Document

**Versao:** 1.0
**Data:** 2026-03-09
**Autora:** Aria (@architect)
**Status:** Draft
**Baseado em:** [PRD v1.2](../prd.md), [Project Brief v1.0](../project-brief.md), [UX/UI Spec v1.0](ux-ui-spec.md), [Front-End Spec v1.0](../front-end-spec.md), [Technical Architecture v1.0](technical-architecture.md)

---

> **This document has been sharded for maintainability.** Each section is now in its own file under `fullstack/`. See the [full index](./fullstack/index.md) for navigation.

## Document Map

| # | Section | File | Lines |
|---|---------|------|-------|
| 1-2 | Introduction & High Level Architecture | [fullstack/high-level.md](./fullstack/high-level.md) | Intro, tech summary, platform choice, repo structure, architecture diagram, patterns |
| 3 | Technology Stack | [fullstack/tech-stack.md](./fullstack/tech-stack.md) | 40+ technology choices with rationale |
| 4 | Data Models | [fullstack/data-models.md](./fullstack/data-models.md) | 9 entities, TypeScript interfaces, ER diagram |
| 5 | API Specification | [fullstack/api-spec.md](./fullstack/api-spec.md) | 42 REST endpoints across 7 epics, request/response examples |
| 6 | Components | [fullstack/components.md](./fullstack/components.md) | Frontend (5), Backend (6), AI Pipeline (6) components + dependency diagram |
| 7 | External APIs | [fullstack/external-apis.md](./fullstack/external-apis.md) | Claude, fal.ai, Replicate, Stripe, Asaas, Supabase |
| 8 | Core Workflows | [fullstack/workflows.md](./fullstack/workflows.md) | 4 Mermaid sequence diagrams: render, chat, diagnostic, auth |
| 9 | Database Schema | [fullstack/database-schema.md](./fullstack/database-schema.md) | PostgreSQL DDL with RLS policies, triggers, functions |
| 10 | Frontend Architecture | [fullstack/frontend-arch.md](./fullstack/frontend-arch.md) | Component org, state management, routing, services layer |
| 11 | Backend Architecture | [fullstack/backend-arch.md](./fullstack/backend-arch.md) | Service architecture, DB access layer, auth/authz |
| 12 | Project Structure | [fullstack/project-structure.md](./fullstack/project-structure.md) | Unified monorepo directory tree |
| 13-14 | DevOps | [fullstack/devops.md](./fullstack/devops.md) | Development workflow, deployment, CI/CD pipeline |
| 15 | Security & Performance | [fullstack/security-performance.md](./fullstack/security-performance.md) | Frontend/backend security, LGPD, performance optimization |
| 16-17 | Testing & Standards | [fullstack/testing.md](./fullstack/testing.md) | Testing pyramid, examples, coding standards, naming conventions |
| 18 | Error Handling | [fullstack/error-handling.md](./fullstack/error-handling.md) | Error flow, response format, backend/frontend handlers |
| 19 | Monitoring | [fullstack/monitoring.md](./fullstack/monitoring.md) | Monitoring stack, key metrics, alerts |
| 20 | Squad Mapping | [fullstack/squad-mapping.md](./fullstack/squad-mapping.md) | Agent-to-module, agent-to-NFR, consultation by epic |
| 21 | Cost Estimate | [fullstack/cost-estimate.md](./fullstack/cost-estimate.md) | Infrastructure costs for MVP (2K renders/month) |

---

## Quality Criteria Checklist

- [x] Every technology choice justified by a requirement (FR-*, NFR-*, CON-*) — [tech-stack.md](./fullstack/tech-stack.md)
- [x] API endpoints cover all 32 functional requirements — [api-spec.md](./fullstack/api-spec.md) (42 endpoints)
- [x] Security considerations address NFR-08, NFR-09, NFR-10, NFR-11 — [security-performance.md](./fullstack/security-performance.md)
- [x] Performance strategy addresses NFR-01 through NFR-07 — [security-performance.md](./fullstack/security-performance.md)
- [x] Infrastructure plan defined with cost estimates — [cost-estimate.md](./fullstack/cost-estimate.md)
- [x] Squad DecorAI agents mapped to architectural components — [squad-mapping.md](./fullstack/squad-mapping.md)
- [x] Data models cover all 7 epics — [data-models.md](./fullstack/data-models.md) (9 entities + ER diagram)
- [x] Mermaid diagrams for architecture overview, workflows, and auth flow — [high-level.md](./fullstack/high-level.md), [workflows.md](./fullstack/workflows.md), [backend-arch.md](./fullstack/backend-arch.md)
- [x] TypeScript interfaces for shared types — [data-models.md](./fullstack/data-models.md) (all entities)
- [x] Database schema with RLS policies for LGPD compliance — [database-schema.md](./fullstack/database-schema.md)

---

*-- Aria (@architect), arquitetando o futuro*

PHASE_COMPLETE
