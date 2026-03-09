# DecorAI Brasil — Fullstack Architecture Document (Index)

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md)
> **Version:** 1.0
> **Date:** 2026-03-09
> **Author:** Aria (@architect)
> **Status:** Draft
> **Based on:** [PRD v1.2](../../prd.md), [Project Brief v1.0](../../project-brief.md), [UX/UI Spec v1.0](../ux-ui-spec.md), [Front-End Spec v1.0](../../front-end-spec.md), [Technical Architecture v1.0](../technical-architecture.md)

---

## Table of Contents

This document has been sharded into the following files for maintainability:

| # | Shard | Sections | Description |
|---|-------|----------|-------------|
| 1 | [high-level.md](./high-level.md) | 1-2 | Introduction, High Level Architecture, Patterns |
| 2 | [tech-stack.md](./tech-stack.md) | 3 | Technology Stack Table |
| 3 | [data-models.md](./data-models.md) | 4 | Data Models, Types, ER Diagram |
| 4 | [api-spec.md](./api-spec.md) | 5 | API Specification, Endpoints, Examples |
| 5 | [components.md](./components.md) | 6 | Frontend + Backend + AI Pipeline Components |
| 6 | [external-apis.md](./external-apis.md) | 7 | Claude, fal.ai, Replicate, Stripe, Asaas, Supabase |
| 7 | [workflows.md](./workflows.md) | 8 | Core Workflows with Mermaid Diagrams |
| 8 | [database-schema.md](./database-schema.md) | 9 | PostgreSQL DDL with RLS |
| 9 | [frontend-arch.md](./frontend-arch.md) | 10 | Frontend Architecture, Routing, State |
| 10 | [backend-arch.md](./backend-arch.md) | 11 | Backend Architecture, Services, Auth |
| 11 | [project-structure.md](./project-structure.md) | 12 | Unified Project Structure |
| 12 | [devops.md](./devops.md) | 13-14 | Development Workflow, Deployment, CI/CD |
| 13 | [security-performance.md](./security-performance.md) | 15 | Security, LGPD, Performance |
| 14 | [testing.md](./testing.md) | 16-17 | Testing Strategy, Coding Standards |
| 15 | [error-handling.md](./error-handling.md) | 18 | Error Handling Strategy |
| 16 | [monitoring.md](./monitoring.md) | 19 | Monitoring and Observability |
| 17 | [squad-mapping.md](./squad-mapping.md) | 20 | Squad DecorAI Mapping |
| 18 | [cost-estimate.md](./cost-estimate.md) | 21 | Infrastructure Cost Estimate |

---

## Quality Criteria Checklist

- [x] Every technology choice justified by a requirement (FR-*, NFR-*, CON-*) — [tech-stack.md](./tech-stack.md)
- [x] API endpoints cover all 32 functional requirements — [api-spec.md](./api-spec.md) (42 endpoints)
- [x] Security considerations address NFR-08, NFR-09, NFR-10, NFR-11 — [security-performance.md](./security-performance.md)
- [x] Performance strategy addresses NFR-01 through NFR-07 — [security-performance.md](./security-performance.md)
- [x] Infrastructure plan defined with cost estimates — [cost-estimate.md](./cost-estimate.md)
- [x] Squad DecorAI agents mapped to architectural components — [squad-mapping.md](./squad-mapping.md)
- [x] Data models cover all 7 epics — [data-models.md](./data-models.md) (9 entities + ER diagram)
- [x] Mermaid diagrams for architecture overview, workflows, and auth flow — [high-level.md](./high-level.md), [workflows.md](./workflows.md), [backend-arch.md](./backend-arch.md)
- [x] TypeScript interfaces for shared types — [data-models.md](./data-models.md) (all entities)
- [x] Database schema with RLS policies for LGPD compliance — [database-schema.md](./database-schema.md)

---

*-- Aria (@architect), arquitetando o futuro*
