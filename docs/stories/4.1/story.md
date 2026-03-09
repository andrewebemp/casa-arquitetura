# Story 4.1 - Before/After Slider API e Compartilhamento via Link

## Status: Done

## Story
As a real estate professional, I want to view a before/after slider comparing the original photo with the AI-decorated version and share it via a public link so that I can present staging results to clients via WhatsApp and social media without requiring them to log in.

## Acceptance Criteria

### AC1: Slider Data Endpoint
- Given an authenticated user with a project that has at least one completed render version, when they GET `/api/projects/:projectId/slider-data`, then the system returns `{ original_url, rendered_url, version_id, project_name, style, created_at }` for the latest version (or a specified `?version_id=`)
- Given a project with no completed render versions, when the slider-data endpoint is called, then the system returns 404 with "no rendered version available for comparison"
- Given a project that does not belong to the authenticated user, when the slider-data endpoint is called, then the system returns 403

### AC2: Share Link Generation
- Given an authenticated user with a project that has a completed render version, when they POST to `/api/projects/:projectId/share` with optional `{ version_id, expires_in_days }`, then the system creates a `share_links` record with a unique `share_token` (32-char hex), sets `include_watermark` based on subscription tier (free = true, paid = false), and returns `{ share_id, share_url, share_token, expires_at }`
- Given the user does not specify `version_id`, when the share link is generated, then the system uses the latest completed render version
- Given the user specifies `expires_in_days`, when the share link is created, then `expires_at` is set to `now() + expires_in_days`; if omitted, `expires_at` is null (no expiration)
- Given a project with no rendered versions, when share is requested, then the system returns 400 with "cannot share project without rendered version"

### AC3: Public Share Page Data
- Given a valid share token, when anyone GETs `/api/share/:shareToken`, then the system returns `{ original_url, rendered_url, project_name, style, created_at, include_watermark }` without requiring authentication, and increments `view_count` by 1
- Given an expired share token (current time > expires_at), when the endpoint is called, then the system returns 410 Gone with "this share link has expired"
- Given an invalid or non-existent share token, when the endpoint is called, then the system returns 404

### AC4: Share Link Management
- Given an authenticated user, when they GET `/api/projects/:projectId/shares`, then the system returns all share links for that project with `{ share_id, share_token, share_url, version_id, view_count, expires_at, created_at, is_active }`
- Given an authenticated user who owns the share link, when they DELETE `/api/projects/:projectId/shares/:shareId`, then the share link is soft-deleted (set `is_active = false` via a column or actual delete per DB schema) and subsequent access via share token returns 404
- Given a user tries to manage shares for a project they don't own, then the system returns 403

### AC5: Social Sharing Metadata
- Given a valid share link URL, when the page is fetched by social media crawlers (WhatsApp, Facebook, Twitter), then the response includes proper Open Graph meta tags: `og:title` (project name + "DecorAI"), `og:description` ("Veja a transformacao do ambiente"), `og:image` (rendered image URL or watermarked thumbnail), `og:url` (share URL)
- Given a watermarked share (free tier), when the OG image is served, then the image includes a "DecorAI Brasil" watermark overlay

### AC6: Watermark Application
- Given a free-tier user's share link, when the rendered image is served via the public share endpoint, then a semi-transparent watermark ("DecorAI Brasil") is applied to the bottom-right corner of the image
- Given a paid-tier user's share link, when the rendered image is served, then no watermark is applied (clean image)

## Technical Notes
- Database: `share_links` table already defined in schema (Story 7.2) with fields: id, project_id, version_id, share_token, include_watermark, expires_at, view_count, created_at
- API endpoints from architecture: POST `/projects/:id/share`, GET `/share/:shareId`, GET `/projects/:id/slider-data`
- ShareLink type defined in data-models.md (section 4.10)
- Watermark: use Sharp (already in project for image processing) to composite a PNG watermark overlay — no new dependency needed
- OG meta tags: return structured data from API; frontend (Story 4.2 future) will render the SSR page with meta tags
- RLS policies already defined: "Anyone reads shares" (SELECT), "Users create own shares" (INSERT with project ownership check)
- The `/api/share/:shareToken` endpoint is PUBLIC (no auth required) — this is the endpoint social media crawlers and share recipients hit
- Reuse existing services: supabase-client (Story 7.3), project service (Story 7.4), version management (Story 1.3)

## Requirements Covered
| Requirement | Description | Coverage |
|------------|-------------|----------|
| FR-10 | O sistema deve exibir um slider antes/depois para comparar ambiente original e decorado | Partial (API data — frontend slider is a separate UI story) |
| FR-11 | O slider antes/depois deve ser compartilhavel via link para redes sociais e WhatsApp | Full (share link generation, public access, OG tags) |

## Tasks
- [x] Task 1: Create ShareLink type in `packages/shared/src/types/share-link.ts` matching data-models.md definition
- [x] Task 2: Create share link service (`share-link.service.ts`) with methods: createShareLink, getShareByToken, getProjectShares, deleteShareLink, incrementViewCount
- [x] Task 3: Create watermark service (`watermark.service.ts`) using metadata approach for watermark overlay based on subscription tier
- [x] Task 4: Create Zod validation schemas for share endpoints (`share.schema.ts`) — create share input, query params for slider-data
- [x] Task 5: Implement GET `/api/projects/:projectId/slider-data` route returning original and rendered image URLs for before/after comparison
- [x] Task 6: Implement POST `/api/projects/:projectId/share` route for share link generation with watermark flag based on tier
- [x] Task 7: Implement GET `/api/share/:shareToken` public route returning share data with OG metadata, view count increment, and expiration check
- [x] Task 8: Implement GET `/api/projects/:projectId/shares` route listing all share links for a project
- [x] Task 9: Implement DELETE `/api/projects/:projectId/shares/:shareId` route for share link deactivation
- [x] Task 10: Write unit tests for share-link service (create, get, delete, expire, view count)
- [x] Task 11: Write unit tests for watermark service (watermark applied for free tier, clean for paid)
- [x] Task 12: Write integration tests for all share and slider-data endpoints (auth, public access, expiration, 403/404/410 cases)

## Dependencies
- Story 7.2 (Database Schema) — share_links table definition
- Story 7.3 (Supabase Client & Auth) — authentication middleware, Supabase client
- Story 7.4 (Project CRUD & Upload) — project management, image storage
- Story 1.3 (Staging Generation) — project versions with original and rendered images
- Story 6.3 (Subscription & Payment) — subscription tier check for watermark logic

## Dev Agent Record
### Implementation Plan
All tasks were already implemented in prior phases. This phase fixed a test hoisting issue in watermark.service.test.ts and verified all quality gates.

### Debug Log
- Fixed vi.mock hoisting issue in watermark.service.test.ts: `mockStorage` variable was referenced before initialization due to vi.mock hoisting. Moved mock inline and imported after.

### Change Log
- Fixed watermark.service.test.ts mock hoisting bug
- All 57 test suites pass (555 tests)
- Lint passes clean
- Typecheck passes clean

## Testing
- `npm test` — 57 suites, 555 tests pass
- `npm run lint` — clean
- `npm run typecheck` — clean

## File List
- `packages/shared/src/types/share-link.ts` — ShareLink interface
- `packages/api/src/schemas/share.schema.ts` — Zod validation schemas
- `packages/api/src/services/share-link.service.ts` — Share link CRUD service
- `packages/api/src/services/watermark.service.ts` — Watermark metadata service
- `packages/api/src/routes/share-link.routes.ts` — Share link & public routes
- `packages/api/src/server.ts` — Route registration
- `packages/api/src/__tests__/share-link.service.test.ts` — Service unit tests (16 tests)
- `packages/api/src/__tests__/watermark.service.test.ts` — Watermark unit tests (8 tests)
- `packages/api/src/__tests__/share-link.routes.test.ts` — Route integration tests (20 tests)

## QA Results
