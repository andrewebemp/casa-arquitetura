# DecorAI Brasil — Technology Stack

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 3

---

## 3. Tech Stack

### 3.1 Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.4+ | Type safety fullstack | Compartilhamento de tipos via packages/shared (CON-07) |
| Frontend Framework | Next.js (App Router) | 14.2+ | SSR/SSG/CSR seletivo | SEO para landing (SSG), dados para dashboard (SSR), interatividade para workspace (CSR) — NFR-12 |
| UI Component Library | shadcn/ui + Radix | latest | Componentes acessiveis | WCAG AA nativo, tree-shakable, customizavel com Tailwind — NFR-12, UX Spec §5 |
| State Management | Zustand + React Query | 4.5+ / 5.0+ | Client state + server state | Zustand para canvas/UI leve, React Query para cache e mutations — Front-End Spec §10 |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first styling | Design tokens customizados, purge automatico, mobile-first — UX Spec §6 |
| Icons | Lucide React | latest | Iconografia | MIT, tree-shakable, 24px grid padrao — UX Spec §6.3 |
| Animations | Framer Motion | 11+ | Microinteracoes | Composited properties (transform/opacity), prefers-reduced-motion — UX Spec §9 |
| Backend Language | TypeScript | 5.4+ | Type safety API | Consistencia com frontend (CON-02) |
| Backend Framework | Fastify | 4.26+ | HTTP server REST | 3x mais rapido que Express, schema validation nativa, TypeScript first |
| API Style | REST | OpenAPI 3.0 | API HTTP | Simplicidade, tooling maduro, compativel com React Query |
| Job Queue | BullMQ | 5.0+ | Fila assincrona de renders | Redis-backed, prioridades por tier, retry, dashboard Bull Board — FR-19, NFR-06 |
| AI Pipeline Language | Python | 3.11+ | Pipeline ML | Ecossistema ML nativo (torch, diffusers, transformers) — FR-21 |
| AI Pipeline Framework | FastAPI | 0.110+ | API HTTP para workers | Async nativo, Pydantic validation, OpenAPI auto |
| AI Generation | SDXL + ControlNet | SDXL 1.0 | Geracao de imagens | Multi-conditioning (depth + normal + edge) — FR-21 |
| Depth Estimation | ZoeDepth / Depth Anything V2 | latest | Estimacao de profundidade | Interpretacao espacial, escala automatica — FR-22, FR-32 |
| Segmentation | SAM 2 | latest | Segmentacao de elementos | Parede, piso, bancada, armario — FR-07 |
| Style Matching | CLIP + IP-Adapter | latest | Extracao e transfer de estilo | 10 estilos brasileiros, referencia visual — FR-02, FR-23 |
| Inpainting | LaMa | latest | Remocao de objetos | Inpainting state-of-art — FR-09 |
| Lighting | IC-Light | latest | Correcao de iluminacao | Fotos escuras e mal expostas — FR-08 |
| Upscale | Real-ESRGAN | latest | Upscale HD 2048x2048 | Resolucao profissional para planos pagos — FR-20 |
| LLM (NLU) | Claude API (Anthropic) | claude-sonnet-4-20250514 | Interpretacao de comandos PT-BR | Qualidade superior em PT-BR, tool use nativo — FR-06 |
| Database | PostgreSQL (Supabase) | 15+ | Dados estruturados | Auth integrado, RLS, realtime, storage — FR-14, NFR-08 |
| Cache | Redis (Upstash) | 7+ | Sessoes, filas, cache semantico | Serverless, pay-per-request, compativel BullMQ — NFR-07 |
| File Storage | Supabase Storage (S3-compat) | — | Imagens originais e geradas | Politicas de acesso, CDN integrado — NFR-11 |
| CDN | Cloudflare | — | Entrega de imagens | Cache global, WebP auto, protecao DDoS — NFR-11 |
| Authentication | Supabase Auth | — | Google OAuth + email/pass | RLS integrado, PKCE flow, LGPD-ready — FR-14, NFR-08 |
| Payments (International) | Stripe | latest | Pagamentos internacionais | Checkout, subscriptions, webhooks — FR-18 |
| Payments (Brasil) | Asaas | latest | Gateway brasileiro | Boleto, PIX, cartao em BRL — FR-18 |
| Realtime | Supabase Realtime | — | WebSocket para progress | Channels por projeto, broadcast — NFR-16 |
| Frontend Testing | Vitest + Testing Library | latest | Unit + component tests | Vite-native, jest-compat, fast — CON-02 |
| Backend Testing | Vitest | latest | Unit + integration tests | Mesmo runner que frontend, TypeScript nativo |
| E2E Testing | Playwright | latest | E2E cross-browser | Chrome, Safari, Firefox, Edge — NFR-13 |
| Accessibility Testing | axe-core (jest-axe) | latest | WCAG AA automatizado | Cada PR valida acessibilidade — UX Spec §7.8 |
| Build Tool | Turborepo | 2.0+ | Monorepo orchestration | Build paralelo, cache remoto — CON-07 |
| Bundler | Turbopack (Next.js) | — | Frontend bundling | HMR rapido, tree-shaking nativo |
| CI/CD | GitHub Actions | — | Pipeline automatizado | Lint, test, typecheck, build, deploy |
| Frontend Monitoring | Vercel Analytics + Web Vitals | — | Core Web Vitals | LCP, FID, CLS tracking — Front-End Spec §10.1 |
| Backend Monitoring | Sentry | latest | Error tracking + APM | Stack traces, breadcrumbs, alertas |
| Logging | Pino | 8+ | Structured JSON logging | Nativo Fastify, baixo overhead, contexto rico |
