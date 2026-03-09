# Story 6.5 - Pricing UI: Pagina de Planos, Comparativo de Features e Checkout Stripe

## Status: Done

## Story
As a corretor de imoveis ou arquiteto visitando o DecorAI Brasil, I want to see a clear pricing page comparing Free, Pro and Business plans with their features and limits so that I can choose the right plan and start a Stripe checkout directly from the page.

## PRD Requirements
- **FR-16**: O sistema deve implementar 3 tiers de pricing: Free (3 renders/mes com marca d'agua), Pro (R$ 79-149/mes) e Business (R$ 299-499/mes) (Must Have — Brief §F10)
- **FR-17**: O sistema deve aplicar marca d'agua nas imagens geradas no tier Free (Must Have — Brief §F10)
- **NFR-12**: A plataforma deve ser web responsiva (desktop + mobile browsers) (Must Have)
- **NFR-14**: Toda a interface deve ser em portugues brasileiro (PT-BR) (Must Have)

## Acceptance Criteria

### AC-1: Pagina de Planos com 3 Cards Comparativos
- Given um usuario (autenticado ou nao) acessa `/app/plano`
- When a pagina carrega
- Then o sistema exibe 3 Pricing Cards lado a lado: Free (R$ 0/mes), Pro (R$ 79-149/mes, badge "Mais Popular"), Business (R$ 299-499/mes), cada card mostrando: nome do tier, preco, lista de features incluidas, e botao CTA

### AC-2: Features Corretas por Tier
- Given a pagina de planos carregada
- When o usuario visualiza os cards
- Then o card Free lista: "3 renders/mes", "Marca d'agua", "1 estilo por vez", "Resolucao 1024px"; o card Pro lista: "100 renders/mes", "Sem marca d'agua", "Chat de refinamento", "Todos os estilos", "Exportar HD 2048px"; o card Business lista: "500 renders/mes", "Sem marca d'agua", "Chat de refinamento", "Todos os estilos", "Exportar HD 2048px", "Suporte prioritario", "API access"

### AC-3: CTA do Card Free
- Given um usuario nao autenticado visualiza o card Free
- When clica em "Comecar Gratis"
- Then e redirecionado para `/app/novo` (wizard de criacao, passando pelo login se necessario)

### AC-4: CTA do Card Pro — Checkout Stripe
- Given um usuario autenticado no tier Free visualiza o card Pro
- When clica em "Assinar Pro"
- Then o sistema chama `POST /subscriptions/checkout` com `tier: "pro"` e `gateway: "stripe"`, recebe a checkout URL do Stripe, e redireciona o usuario para a pagina de checkout do Stripe

### AC-5: CTA do Card Business — Checkout Stripe
- Given um usuario autenticado no tier Free visualiza o card Business
- When clica em "Assinar Business"
- Then o sistema chama `POST /subscriptions/checkout` com `tier: "business"` e `gateway: "stripe"`, recebe a checkout URL do Stripe, e redireciona o usuario para a pagina de checkout do Stripe

### AC-6: Usuario Nao Autenticado — Redirect para Login
- Given um usuario nao autenticado tenta clicar em "Assinar Pro" ou "Assinar Business"
- When o clique ocorre
- Then o usuario e redirecionado para `/auth/login` com `?redirect=/app/plano` para retornar apos autenticacao

### AC-7: Plano Atual Destacado para Usuario Autenticado
- Given um usuario autenticado com subscription ativa (ex: Pro)
- When a pagina carrega
- Then o card do plano atual exibe badge "Plano Atual" no lugar do botao CTA, os outros cards mostram "Fazer Upgrade" ou "Fazer Downgrade" conforme aplicavel

### AC-8: Gerenciamento de Assinatura Existente
- Given um usuario autenticado com subscription ativa (Pro ou Business)
- When a pagina carrega
- Then uma secao acima dos cards exibe: tier atual, renders usados/disponivelis no periodo, data de renovacao, e um botao "Gerenciar Assinatura" que redireciona para o Stripe Billing Portal (via `POST /subscriptions/portal`)

### AC-9: Loading e Error States
- Given a pagina esta carregando dados de subscription
- When a requisicao esta em andamento
- Then skeleton placeholders aparecem nos cards; se a API retorna erro ao criar checkout, uma mensagem amigavel "Nao foi possivel iniciar o checkout. Tente novamente." aparece com botao de retry

### AC-10: Responsividade Mobile
- Given um usuario acessa `/app/plano` em dispositivo mobile (viewport < 768px)
- When a pagina renderiza
- Then os Pricing Cards empilham verticalmente com o card Pro no topo (destaque), e todas as interacoes funcionam via touch

### AC-11: FAQ de Planos
- Given a pagina de planos carregada
- When o usuario faz scroll alem dos cards
- Then uma secao FAQ exibe perguntas frequentes em PT-BR: "Posso trocar de plano?", "Como funciona o periodo de teste?", "Quais formas de pagamento?", "O que acontece se meus renders acabarem?" com respostas em acordeao expansivel

## Technical Notes

### Architecture References
- Component library: `docs/architecture/ux-ui/component-library.md` — Pricing Card molecule (Section 5.2)
- Information architecture: `docs/architecture/ux-ui/information-architecture.md` — /app/plano
- Wireframes: `docs/architecture/ux-ui/wireframes.md` — Landing page pricing section (Section 4.1)
- Frontend arch: `docs/architecture/fullstack/frontend-arch.md` — /app/plano route (SSR, Auth)
- Responsiveness: `docs/architecture/ux-ui/responsiveness.md` — Pricing cards stacked mobile, 3 columns desktop

### API Endpoints Consumed
- `GET /subscriptions/me` — Tier atual, renders usados/limite, periodo (Story 6.3)
- `POST /subscriptions/checkout` — Criar Stripe Checkout Session, retorna checkout URL (Story 6.3)
- `POST /subscriptions/portal` — Criar Stripe Billing Portal session, retorna portal URL (Story 6.3)

### State Management
- Server state: React Query (`useSubscription` hook from Story 6.4) for subscription data
- Mutations: `useMutation` for checkout and portal session creation
- Auth state: Supabase auth context (Story 7.7) — determines if user is logged in

### Key Components
- `PricingCard` molecule — tier name, price, feature list, CTA button, "Plano Atual" badge, "Mais Popular" badge
- `PricingGrid` — responsive layout (3 cols desktop, stacked mobile with Pro first)
- `SubscriptionSummary` — current plan info, renders used/limit, renewal date, manage button (shown for active subscribers)
- `PricingFAQ` — accordion with frequently asked questions
- `CheckoutButton` — handles checkout flow (auth check, API call, redirect to Stripe)

### Existing Foundation
- `useSubscription` hook (Story 6.4) — fetches subscription data
- Subscription checkout API (Story 6.3) — `POST /subscriptions/checkout`, `POST /subscriptions/portal`
- `TIER_LIMITS` constants (packages/shared) — renders per tier
- HeaderApp component (Story 7.7) — navigation
- Button, Badge atom components (Story 7.7)
- QueryClientProvider (Story 6.4)
- Auth context and protected routes (Story 7.7)

### Pricing Data (from PRD)
| Tier | Preco | Renders/mes | Resolucao | Marca d'agua | Features |
|------|-------|-------------|-----------|--------------|----------|
| Free | R$ 0 | 3 | 1024px | Sim | Basico |
| Pro | R$ 79-149 | 100 | 2048px | Nao | Chat, todos estilos, HD |
| Business | R$ 299-499 | 500 | 2048px | Nao | Tudo do Pro + suporte prioritario + API |

## Tasks
- [x] Task 1: Create pricing constants in `packages/shared/src/constants/pricing.ts` — tier names, prices, feature lists, CTA labels (single source of truth for both landing page and billing page)
- [x] Task 2: Create `PricingCard` molecule (`packages/web/src/components/molecules/PricingCard.tsx`) — tier name, price display, feature list with checkmarks, CTA button, "Mais Popular" badge, "Plano Atual" badge
- [x] Task 3: Create `PricingGrid` component (`packages/web/src/components/organisms/PricingGrid.tsx`) — 3-column responsive grid, highlights current plan, passes checkout handlers
- [x] Task 4: Create `SubscriptionSummary` component (`packages/web/src/components/molecules/SubscriptionSummary.tsx`) — shows current tier, renders used/limit progress bar, renewal date, "Gerenciar Assinatura" button
- [x] Task 5: Create `PricingFAQ` component (`packages/web/src/components/molecules/PricingFAQ.tsx`) — accordion with 4+ FAQ items in PT-BR
- [x] Task 6: Create `useCheckout` hook (`packages/web/src/hooks/use-checkout.ts`) — React Query mutation wrapping `POST /subscriptions/checkout`, handles redirect to Stripe URL
- [x] Task 7: Create `usePortal` hook (`packages/web/src/hooks/use-portal.ts`) — React Query mutation wrapping `POST /subscriptions/portal`, handles redirect to Stripe Billing Portal
- [x] Task 8: Implement billing page `packages/web/src/app/(dashboard)/plano/page.tsx` — compose SubscriptionSummary (if subscriber), PricingGrid, PricingFAQ, loading/error states
- [x] Task 9: Handle unauthenticated user flow — redirect to `/auth/login?redirect=/app/plano` when trying to checkout without auth
- [x] Task 10: Write unit tests for PricingCard (renders tier info, feature list, CTA, badges), PricingGrid (responsive layout, current plan highlighting), SubscriptionSummary (renders usage, manage button), PricingFAQ (accordion expand/collapse)
- [x] Task 11: Write unit tests for useCheckout (calls API, redirects on success, handles error), usePortal (calls API, redirects on success)
- [x] Task 12: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.7 (Frontend Shell — layouts, auth, atoms, route structure) - provides base layout and auth context
- Story 6.3 (Subscription & Payment API) - provides checkout, portal, and subscription endpoints
- Story 6.4 (Dashboard UI) - provides `useSubscription` hook and QueryClientProvider

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log
- 2026-03-09: Implemented all 12 tasks — pricing constants, PricingCard, PricingGrid, SubscriptionSummary, PricingFAQ, useCheckout, usePortal hooks, /plano page, auth redirect flow, 32 unit tests. All quality gates pass.

## Testing
- Unit tests for PricingCard molecule (renders tier name, price, features; shows "Mais Popular" badge for Pro; shows "Plano Atual" badge when active; CTA click triggers handler)
- Unit tests for PricingGrid organism (renders 3 cards; highlights current tier; mobile layout stacks cards)
- Unit tests for SubscriptionSummary (renders current tier info; shows renders progress bar; manage button calls portal API)
- Unit tests for PricingFAQ (renders FAQ items; accordion expand/collapse toggles content)
- Unit tests for useCheckout hook (calls POST /subscriptions/checkout; redirects to Stripe URL; handles API error)
- Unit tests for usePortal hook (calls POST /subscriptions/portal; redirects to Stripe URL; handles API error)
- Integration: billing page renders PricingGrid with mocked subscription data; shows SubscriptionSummary for authenticated subscribers; handles checkout flow end-to-end

## File List
- `packages/shared/src/constants/pricing.ts` (created) — Pricing tier data, feature lists, FAQ content
- `packages/shared/src/constants/index.ts` (modified) — Export pricing constants
- `packages/web/src/components/molecules/PricingCard.tsx` (created) — Pricing card molecule with tier info, features, badges, CTA
- `packages/web/src/components/molecules/SubscriptionSummary.tsx` (created) — Current subscription info with renders progress bar
- `packages/web/src/components/molecules/PricingFAQ.tsx` (created) — Accordion FAQ component in PT-BR
- `packages/web/src/components/organisms/PricingGrid.tsx` (created) — 3-column responsive pricing grid
- `packages/web/src/hooks/use-checkout.ts` (created) — React Query mutation for Stripe checkout
- `packages/web/src/hooks/use-portal.ts` (created) — React Query mutation for Stripe billing portal
- `packages/web/src/app/(dashboard)/plano/page.tsx` (created) — Billing page composing all pricing components
- `packages/web/src/__tests__/molecules/pricing-card.test.tsx` (created) — 10 unit tests for PricingCard
- `packages/web/src/__tests__/molecules/subscription-summary.test.tsx` (created) — 6 unit tests for SubscriptionSummary
- `packages/web/src/__tests__/molecules/pricing-faq.test.tsx` (created) — 6 unit tests for PricingFAQ
- `packages/web/src/__tests__/organisms/pricing-grid.test.tsx` (created) — 4 unit tests for PricingGrid
- `packages/web/src/__tests__/hooks/use-checkout.test.ts` (modified) — Fixed window.location mock, 3 tests
- `packages/web/src/__tests__/hooks/use-portal.test.ts` (modified) — Fixed window.location mock, 3 tests

## QA Results
