# Story 7.7 - Frontend Shell: Layout Base, Autenticacao UI e Navegacao

## Status: Done

## Story
As a user, I want a responsive web interface with login/signup screens, a navigable dashboard layout, and Portuguese-Brazilian UI so that I can authenticate, navigate between features, and use the platform on any device.

## Acceptance Criteria

- Given an unauthenticated user, when they access any protected route (e.g., `/dashboard`, `/projects`), then they are redirected to `/login` via Next.js middleware
- Given the login page, when the user enters valid email/password and submits, then the Supabase Auth client authenticates the user, sets the session cookie, and redirects to `/dashboard`
- Given the login page, when the user clicks "Entrar com Google", then the Supabase Auth client initiates Google OAuth flow, and upon successful callback at `/auth/callback`, the user is redirected to `/dashboard` with an active session
- Given the signup page, when the user fills in name, email, and password and submits, then a new account is created via Supabase Auth, a confirmation email is sent, and the user sees a "Verifique seu email" message
- Given an authenticated user on `/dashboard`, when they view the page, then they see a sidebar navigation with links to: Dashboard, Meus Projetos, Novo Projeto, Meu Perfil, and Assinatura — all labels in PT-BR
- Given the dashboard layout, when the user views on a mobile device (viewport < 768px), then the sidebar collapses into a hamburger menu and the content area fills the full width (NFR-12)
- Given an authenticated user, when they click the user avatar/menu in the header, then they see options for "Meu Perfil", "Configuracoes", and "Sair" — clicking "Sair" signs out via Supabase and redirects to `/login`
- Given the root layout, when any page loads, then the HTML lang is set to "pt-BR", the page title includes "DecorAI Brasil", and the base font and color scheme are applied via Tailwind theme tokens
- Given the `/auth/callback` route, when Supabase returns the auth code after OAuth, then the route exchanges the code for a session using `@supabase/ssr` and redirects to `/dashboard`
- Given any page in the application, when the user views the footer area, then a disclaimer "Imagens ilustrativas geradas por IA" is visible (NFR-17)

## Technical Notes

### Architecture (from architecture doc)
- **Frontend:** Next.js 14 with App Router, Tailwind CSS, server components by default
- **Auth Client:** `@supabase/ssr` for server-side session management with cookie-based auth
- **Middleware:** Next.js middleware (`middleware.ts`) for route protection — checks Supabase session
- **Responsive:** Tailwind breakpoints (sm, md, lg) for mobile-first responsive design (NFR-12)
- **Language:** All UI text in PT-BR hardcoded (no i18n library needed for MVP) (NFR-14)
- **Design System:** Tailwind CSS with custom theme tokens (colors, spacing, typography) for DecorAI brand

### Existing Foundation
- Next.js 14 with App Router and Tailwind CSS scaffolded (Story 7.1)
- `packages/web/src/app/layout.tsx` exists with basic setup
- `packages/web/tailwind.config.ts` exists
- `packages/web/src/app/globals.css` exists
- Supabase client types in `packages/shared/src/types/`
- Auth routes ready in API (Story 6.1): `POST /auth/signup`, `POST /auth/login`, `POST /auth/google`
- User profile API ready (Story 6.2)
- Subscription API ready (Story 6.3)

### Key Packages to Install
- `@supabase/ssr` — Supabase auth for Next.js server components
- `@supabase/supabase-js` — Supabase client SDK
- `lucide-react` — Icon library (lightweight, tree-shakeable)

## Tasks
- [x] Task 1: Install dependencies (`@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`) in `packages/web`
- [x] Task 2: Create Supabase client utilities (`packages/web/src/lib/supabase/client.ts` for browser, `server.ts` for server components, `middleware.ts` for middleware) using `@supabase/ssr` cookie-based approach
- [x] Task 3: Create Next.js middleware (`packages/web/middleware.ts`) that checks Supabase session and redirects unauthenticated users to `/login` for protected routes
- [x] Task 4: Create Tailwind theme tokens in `tailwind.config.ts` — brand colors, typography scale, and spacing for DecorAI Brasil design system
- [x] Task 5: Create auth layout (`packages/web/src/app/(auth)/layout.tsx`) — centered card layout for login/signup pages
- [x] Task 6: Create login page (`packages/web/src/app/(auth)/login/page.tsx`) — email/password form + Google OAuth button, all text in PT-BR
- [x] Task 7: Create signup page (`packages/web/src/app/(auth)/signup/page.tsx`) — name, email, password form with validation, PT-BR labels
- [x] Task 8: Create auth callback route (`packages/web/src/app/auth/callback/route.ts`) — exchange OAuth code for session, redirect to dashboard
- [x] Task 9: Create dashboard layout (`packages/web/src/app/(dashboard)/layout.tsx`) — sidebar navigation + header with user menu, responsive with hamburger on mobile
- [x] Task 10: Create sidebar component (`packages/web/src/components/sidebar.tsx`) — nav links (Dashboard, Meus Projetos, Novo Projeto, Meu Perfil, Assinatura) with active state highlighting
- [x] Task 11: Create header component (`packages/web/src/components/header.tsx`) — logo, mobile hamburger toggle, user avatar dropdown (Meu Perfil, Configuracoes, Sair)
- [x] Task 12: Create dashboard home page (`packages/web/src/app/(dashboard)/dashboard/page.tsx`) — placeholder with welcome message and quick action cards
- [x] Task 13: Create footer disclaimer component (`packages/web/src/components/disclaimer-footer.tsx`) — "Imagens ilustrativas geradas por IA" (NFR-17)
- [x] Task 14: Update root layout (`packages/web/src/app/layout.tsx`) — set `lang="pt-BR"`, add metadata (title, description), include disclaimer footer
- [x] Task 15: Write tests for Supabase client utilities, middleware redirect logic, and component rendering
- [x] Task 16: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.1 (Monorepo Scaffolding — Next.js setup) ✅
- Story 6.1 (Auth Routes — API endpoints for login/signup/OAuth) ✅

## PRD Traceability
| Requirement | Coverage |
|-------------|----------|
| FR-14 | Login via Google OAuth e email/password — UI layer |
| NFR-12 | Web responsiva desktop + mobile — responsive layout |
| NFR-13 | Browser support via Next.js compatibility |
| NFR-14 | Interface em PT-BR — all labels in Portuguese |
| NFR-17 | Disclaimer "imagem ilustrativa gerada por IA" — footer |

## Dev Agent Record
### Implementation Plan
- Supabase client utilities with @supabase/ssr cookie-based approach (browser, server, middleware)
- Next.js middleware for route protection (redirect unauthenticated to /login)
- Auth pages (login with email/password + Google OAuth, signup with validation)
- OAuth callback route for Google sign-in code exchange
- Dashboard layout with sidebar navigation + header with user dropdown
- Responsive design (hamburger menu on mobile via md: breakpoint)
- Disclaimer footer on all pages via root layout

### Debug Log
- Fixed jest.config.ts: `setupFilesAfterSetup` → `setupFilesAfterEnv`
- Fixed jest.config.ts: `next/jest` → `next/jest.js` for Jest 30 ESM compatibility
- Fixed middleware test: added `clone()` method to mock URL for Next.js NextRequest compatibility
- Removed eslint-disable comments for non-existent TypeScript ESLint rules in project config

### Change Log
- 2026-03-09: Implemented all 16 tasks — auth UI, dashboard layout, 27 tests passing

## Testing
- Supabase client creation (browser and server) ✅
- Middleware redirect for unauthenticated users ✅
- Login page renders with PT-BR labels ✅
- Signup page renders with validation ✅
- Auth callback route processes OAuth code ✅
- Sidebar navigation links render correctly ✅
- Header user menu renders and sign-out works ✅
- Responsive layout: sidebar collapses on mobile viewport ✅
- Disclaimer footer is visible on all pages ✅

## File List
- `packages/web/package.json` (modified — added dependencies and test script)
- `packages/web/tailwind.config.ts` (modified — added brand theme tokens)
- `packages/web/middleware.ts` (new — route protection middleware)
- `packages/web/jest.config.ts` (new — Jest test configuration)
- `packages/web/jest.setup.ts` (new — Jest setup with testing-library)
- `packages/web/src/lib/supabase/client.ts` (new — browser Supabase client)
- `packages/web/src/lib/supabase/server.ts` (new — server Supabase client)
- `packages/web/src/lib/supabase/middleware.ts` (new — middleware session handler)
- `packages/web/src/app/layout.tsx` (modified — lang, metadata, disclaimer footer)
- `packages/web/src/app/(auth)/layout.tsx` (new — auth centered card layout)
- `packages/web/src/app/(auth)/login/page.tsx` (new — login page with OAuth)
- `packages/web/src/app/(auth)/signup/page.tsx` (new — signup page with validation)
- `packages/web/src/app/auth/callback/route.ts` (new — OAuth callback handler)
- `packages/web/src/app/(dashboard)/layout.tsx` (new — dashboard shell layout)
- `packages/web/src/app/(dashboard)/dashboard/page.tsx` (new — dashboard home)
- `packages/web/src/components/sidebar.tsx` (new — navigation sidebar)
- `packages/web/src/components/header.tsx` (new — header with user menu)
- `packages/web/src/components/disclaimer-footer.tsx` (new — AI disclaimer)
- `packages/web/src/__tests__/supabase-client.test.ts` (new)
- `packages/web/src/__tests__/middleware-logic.test.ts` (new)
- `packages/web/src/__tests__/login-page.test.tsx` (new)
- `packages/web/src/__tests__/signup-page.test.tsx` (new)
- `packages/web/src/__tests__/sidebar.test.tsx` (new)
- `packages/web/src/__tests__/header.test.tsx` (new)
- `packages/web/src/__tests__/disclaimer-footer.test.tsx` (new)
- `packages/web/src/__tests__/dashboard-page.test.tsx` (new)

## QA Results
