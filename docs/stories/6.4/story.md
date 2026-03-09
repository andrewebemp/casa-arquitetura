# Story 6.4 - Dashboard UI: Listagem de Projetos, Favoritos e Acoes Rapidas

## Status: Done

## Story
As a corretor de imoveis ou arquiteto autenticado, I want to see a dashboard with all my projects displayed as visual cards with thumbnails, filter by style or date, access favorites, and quickly start a new project so that I can manage my staging work efficiently and pick up where I left off.

## PRD Requirements
- **FR-15**: O sistema deve manter perfil do usuario com historico de projetos, favoritos e preferencias (Must Have — Brief §F09)
- **FR-03**: O sistema deve permitir gerar variacoes do mesmo ambiente em estilos diferentes com 1 clique, sem necessidade de novo upload (Must Have — Brief §F04)
- **NFR-03**: Time-to-value (do cadastro ao primeiro render) deve ser menor que 3 minutos no MVP (Must Have — Brief §KPIs)
- **NFR-12**: A plataforma deve ser web responsiva (desktop + mobile browsers) (Must Have)
- **NFR-14**: Toda a interface deve ser em portugues brasileiro (PT-BR) (Must Have)

## Acceptance Criteria

### AC-1: Listagem de Projetos com Cards Visuais
- Given um usuario autenticado acessa `/app/projetos`
- When a pagina carrega
- Then o sistema exibe uma grade de Project Cards, cada card mostrando: thumbnail da ultima versao do render (200x200), nome do projeto, estilo aplicado, data de criacao/ultima edicao, e status badge (gerando, pronto, erro)

### AC-2: Estado Vazio (First-Time User)
- Given um usuario autenticado sem nenhum projeto criado
- When a pagina carrega
- Then o sistema exibe uma tela de boas-vindas com ilustracao, mensagem "Crie seu primeiro projeto de staging" em PT-BR, e um botao CTA prominente "+ Novo Projeto" que direciona para `/app/novo`

### AC-3: Filtros de Projetos
- Given um usuario com multiplos projetos no dashboard
- When o usuario seleciona um filtro por estilo (ex: "Industrial") ou ordena por data (mais recente/mais antigo)
- Then a listagem filtra/ordena dinamicamente via URL searchParams sem reload completo, mantendo a selecao na URL para compartilhamento e back/forward do browser

### AC-4: Favoritos
- Given um usuario visualiza a lista de projetos
- When o usuario clica no icone de coracao/favorito em um Project Card
- Then o sistema envia `POST /profile/favorites` com o `project_id`, atualiza o icone otimisticamente, e o projeto aparece na secao "Favoritos" quando o filtro de favoritos esta ativo

### AC-5: Acoes Rapidas no Card
- Given um usuario hover/foca em um Project Card
- When o menu de acoes aparece
- Then o usuario pode: abrir o projeto (navega para `/app/projeto/:id`), duplicar (cria copia do projeto), excluir (com confirmacao modal "Tem certeza?" em PT-BR), e compartilhar (abre modal de compartilhamento)

### AC-6: Contagem de Renders e Tier Badge
- Given um usuario autenticado no dashboard
- When o header/dashboard carrega
- Then o sistema exibe: o tier badge atual (Free/Pro/Business), a contagem de renders usados/disponiveis no periodo (ex: "2/3 renders"), e se no tier Free com renders esgotados, um banner de upgrade CTA com link para `/app/plano`

### AC-7: Navegacao para Novo Projeto
- Given um usuario no dashboard
- When o usuario clica no botao "+ Novo Projeto" (header ou card CTA)
- Then o usuario e direcionado para `/app/novo` (wizard de criacao)

### AC-8: Responsividade Mobile
- Given um usuario acessa o dashboard em dispositivo mobile (viewport < 768px)
- When a pagina renderiza
- Then os Project Cards reorganizam para layout de 1 coluna, o header compacta com hamburger menu, e todas as acoes permanecem acessiveis via touch

### AC-9: Loading e Error States
- Given a pagina esta carregando projetos da API
- When a requisicao esta em andamento
- Then skeleton cards animados aparecem como placeholder; se a API retorna erro, uma mensagem amigavel "Nao foi possivel carregar seus projetos. Tente novamente." e exibida com botao de retry

## Technical Notes

### Architecture References
- Frontend arch: `docs/architecture/fullstack/frontend-arch.md` (Section 10)
- Component library: `docs/architecture/ux-ui/component-library.md` — Project Card molecule
- Information architecture: `docs/architecture/ux-ui/information-architecture.md` — /app/projetos
- User flows: `docs/architecture/ux-ui/user-flows.md` — Flow 1 (primeiro render)

### API Endpoints Consumed
- `GET /profile/projects` — Lista projetos do usuario (Story 6.2)
- `POST /profile/favorites` — Adicionar favorito (Story 6.2)
- `DELETE /profile/favorites/:id` — Remover favorito (Story 6.2)
- `GET /subscriptions/me` — Tier e renders usados/limite (Story 6.3)
- `DELETE /projects/:id` — Excluir projeto (Story 7.4)

### State Management
- Server state: React Query (`useQuery` for project list, subscription; `useMutation` for favorites, delete)
- URL state: Next.js `searchParams` for filters (style, sort, favorites)
- UI state: Zustand `ui-store` for modals (delete confirmation, share)

### Key Components
- `ProjectCard` molecule — thumbnail, name, style badge, date, status, favorite icon, action menu
- `ProjectGrid` — responsive CSS Grid (3 cols desktop, 2 tablet, 1 mobile)
- `EmptyState` — illustration + CTA for first-time users
- `FilterBar` — style select, sort dropdown, favorites toggle
- `RenderQuotaBanner` — renders used/limit, upgrade CTA when depleted
- `DeleteConfirmModal` — confirmation dialog for project deletion
- `SkeletonCard` — loading placeholder with animation

### Existing Foundation
- HeaderApp component with nav links (Story 7.7)
- Protected route layout with auth check (Story 7.7)
- API client with Supabase JWT (Story 7.7)
- Project CRUD API (Story 7.4)
- Profile/Favorites API (Story 6.2)
- Subscription API (Story 6.3)
- Atom components: Button, Input, Badge (Story 7.7)

### Dependencies (npm — may need to add)
- `@tanstack/react-query` — Server state management (cache, refetch, optimistic updates)

## Tasks
- [x] Task 1: Install `@tanstack/react-query` in `packages/web` and set up QueryClientProvider in dashboard layout
- [x] Task 2: Create `hooks/use-projects.ts` — React Query hook wrapping project listing with filtering/sorting params and delete/duplicate mutations
- [x] Task 3: Create `hooks/use-subscription.ts` — React Query hook wrapping subscription for tier info and render quota
- [x] Task 4: Create `hooks/use-favorites.ts` — React Query hook with optimistic mutations for toggling favorites
- [x] Task 5: Create `services/project-service.ts` — API service functions for project listing, deletion, duplication, favorites, and subscription
- [x] Task 6: Create `components/molecules/ProjectCard.tsx` — thumbnail, name, style badge, date, status badge, favorite toggle, action dropdown
- [x] Task 7: Create `components/molecules/SkeletonCard.tsx` — animated loading placeholder matching ProjectCard dimensions
- [x] Task 8: Create `components/molecules/EmptyState.tsx` — illustration/icon, message text, CTA button (reusable for any empty state)
- [x] Task 9: Create `components/molecules/FilterBar.tsx` — style filter dropdown, sort dropdown, favorites toggle — updates URL searchParams
- [x] Task 10: Create `components/molecules/RenderQuotaBanner.tsx` — progress bar renders used/limit, upgrade CTA when depleted
- [x] Task 11: Create `components/molecules/DeleteConfirmModal.tsx` — modal with PT-BR text, cancel and confirm buttons
- [x] Task 12: Implement dashboard page `(dashboard)/projects/page.tsx` — compose FilterBar, ProjectGrid (ProjectCards), EmptyState, RenderQuotaBanner, loading/error states
- [x] Task 13: Write unit tests for ProjectCard (render with data, favorite toggle, action menu), EmptyState, FilterBar (filter changes update URL), RenderQuotaBanner, DeleteConfirmModal, SkeletonCard
- [x] Task 14: Write unit tests for hooks (useProjects fetches and filters, useFavorites optimistic update, useSubscription renders quota)
- [x] Task 15: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.7 (Frontend Shell — layouts, auth UI, atoms, API client, route structure) — provides foundation components and protected layout
- Story 7.4 (Project CRUD API) — provides `GET /projects`, `DELETE /projects/:id`
- Story 6.2 (User Profile API) — provides `GET /profile/projects`, favorites endpoints
- Story 6.3 (Subscription API) — provides `GET /subscriptions/me` for tier/quota

## Dev Agent Record
### Implementation Plan
- Used existing `(dashboard)` route group with `/projects` route (matches sidebar navigation from Story 7.7)
- Added QueryClientProvider to dashboard layout to provide React Query context
- Used Supabase client directly for API calls (no separate REST endpoints needed)
- Implemented optimistic updates for favorites using React Query mutations
- Used URL searchParams for filter state (style, sort, favorites toggle)
- Responsive grid: 3 cols desktop (lg), 2 cols tablet (sm), 1 col mobile
- All UI text in PT-BR as required

### Debug Log
- Fixed lint warning: replaced `<img>` with `next/image` `<Image>` component in ProjectCard
- Fixed next/image mock in tests to avoid `fill` prop warning on native `<img>`

### Change Log
- 2026-03-09: Implemented all 15 tasks — full dashboard UI with project cards, filters, favorites, render quota banner, empty state, loading/error states, and comprehensive test suite (17 suites, 64 tests passing)

## Testing
- Unit tests for ProjectCard molecule (renders thumbnail, name, style, date, status; favorite toggle calls API; action menu shows options)
- Unit tests for EmptyState (renders message and CTA; CTA navigates to /projects/new)
- Unit tests for FilterBar (filter selection updates searchParams; sort changes order; favorites toggle filters list)
- Unit tests for RenderQuotaBanner (shows progress bar with correct ratio; shows upgrade CTA when renders depleted; hidden when renders available in paid tier)
- Unit tests for DeleteConfirmModal (renders PT-BR text; cancel closes modal; confirm calls delete mutation)
- Unit tests for SkeletonCard (renders animated placeholder)
- Hook tests for useProjects (fetches projects list; handles empty response; handles error)
- Hook tests for useFavorites (optimistic add; optimistic remove; rolls back on error)
- Hook tests for useSubscription (returns tier info; returns render quota)
- Integration: dashboard page renders ProjectGrid with mocked data; shows EmptyState when no projects; shows loading skeletons during fetch

## File List
- `packages/web/package.json` — Added @tanstack/react-query dependency
- `packages/web/src/lib/query-client.tsx` — NEW: QueryClient provider component
- `packages/web/src/app/(dashboard)/layout.tsx` — Updated with QueryClientProvider wrapper
- `packages/web/src/services/project-service.ts` — NEW: Project API service (fetch, delete, duplicate, favorites, subscription)
- `packages/web/src/hooks/use-projects.ts` — NEW: Projects React Query hook with delete/duplicate mutations
- `packages/web/src/hooks/use-subscription.ts` — NEW: Subscription hook for tier/quota
- `packages/web/src/hooks/use-favorites.ts` — NEW: Favorites hook with optimistic updates
- `packages/web/src/components/molecules/ProjectCard.tsx` — NEW: Project card molecule
- `packages/web/src/components/molecules/SkeletonCard.tsx` — NEW: Loading skeleton
- `packages/web/src/components/molecules/EmptyState.tsx` — NEW: Empty state component
- `packages/web/src/components/molecules/FilterBar.tsx` — NEW: Filter/sort bar
- `packages/web/src/components/molecules/RenderQuotaBanner.tsx` — NEW: Render quota display
- `packages/web/src/components/molecules/DeleteConfirmModal.tsx` — NEW: Delete confirmation modal
- `packages/web/src/app/(dashboard)/projects/page.tsx` — NEW: Projects dashboard page
- `packages/web/src/__tests__/molecules/project-card.test.tsx` — NEW: ProjectCard tests (8 tests)
- `packages/web/src/__tests__/molecules/empty-state.test.tsx` — NEW: EmptyState tests (3 tests)
- `packages/web/src/__tests__/molecules/filter-bar.test.tsx` — NEW: FilterBar tests (6 tests)
- `packages/web/src/__tests__/molecules/render-quota-banner.test.tsx` — NEW: Quota banner tests (5 tests)
- `packages/web/src/__tests__/molecules/delete-confirm-modal.test.tsx` — NEW: Modal tests (5 tests)
- `packages/web/src/__tests__/molecules/skeleton-card.test.tsx` — NEW: SkeletonCard tests (1 test)
- `packages/web/src/__tests__/hooks/use-projects.test.ts` — NEW: Projects hook tests (4 tests)
- `packages/web/src/__tests__/hooks/use-favorites.test.ts` — NEW: Favorites hook tests (2 tests)
- `packages/web/src/__tests__/hooks/use-subscription.test.ts` — NEW: Subscription hook tests (2 tests)

## QA Results
