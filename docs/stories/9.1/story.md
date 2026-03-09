# Story 9.1 - Render Quality Feedback: Sistema de Avaliacao de Satisfacao e NPS

## Status: Draft

## Story
As a DecorAI user who has generated renders, I want to rate the quality of each render and provide feedback so that the platform can measure user satisfaction (target > 4.0/5.0), collect NPS scores, and use this data to improve the AI pipeline quality over time.

## PRD Requirements
| Requirement | Description | Coverage |
|-------------|-------------|----------|
| NFR-15 | Qualidade perceptual dos renders deve atingir satisfacao > 4.0/5.0 em pesquisa com usuarios | Full |
| USM-02 | Satisfacao com qualidade > 4.0/5.0 (metrica de sucesso 90 dias) | Full |
| USM-05 | NPS > 40 (metrica de sucesso 90 dias) | Full |
| USM-03 | 70% usam chat de refinamento (tracking de uso) | Partial (analytics foundation) |

## Acceptance Criteria

### AC1: Render Rating API
- Given an authenticated user with a completed render, when they POST to `/api/renders/:renderId/rating` with `{ score: 1-5, tags: ['realistic', 'style_match', 'lighting', 'furniture_quality'], comment?: string }`, then the system stores the rating linked to the render, user, style, and tier
- Given a render that already has a rating from this user, when they POST again, then the previous rating is updated (upsert behavior)
- Given an unauthenticated user, when they attempt to rate, then the system returns 401

### AC2: Post-Render Rating Prompt (UI)
- Given a render has completed and is displayed to the user, when 3 seconds have elapsed, then a non-intrusive rating prompt slides in below the render image with 5 stars and optional quality tags (Realismo, Estilo, Iluminacao, Mobilia, Composicao)
- Given the user clicks a star rating, when they optionally select tags and/or type a comment, then the rating is submitted via API and the prompt collapses with a "Obrigado pelo feedback!" confirmation
- Given the user dismisses the prompt without rating, when they close it, then the prompt does not reappear for this render but may appear for the next render

### AC3: NPS Survey (Periodic)
- Given an authenticated user who has completed 3+ renders and has not been surveyed in the last 30 days, when they visit the dashboard, then a modal NPS survey appears asking "Em uma escala de 0 a 10, qual a probabilidade de voce recomendar o DecorAI a um colega?" with an optional text field "O que poderiamos melhorar?"
- Given the user submits the NPS score, when stored, then it is linked to user ID, tier, total renders count, and submission date
- Given the user dismisses the NPS modal, when they close it, then `nps_dismissed_at` is recorded and the survey does not reappear for 30 days

### AC4: Rating Analytics API (Admin)
- Given an admin user, when they GET `/api/admin/analytics/ratings`, then the system returns aggregated data: average rating (overall and per-style), rating distribution (1-5), total ratings count, trend over last 30 days, and top/bottom rated styles
- Given an admin user, when they GET `/api/admin/analytics/nps`, then the system returns: NPS score (promoters - detractors percentage), response count, distribution (0-10), trend over last 30 days, and common improvement themes
- Given query parameters `?from=DATE&to=DATE&tier=TIER&style=STYLE`, when provided, then results are filtered accordingly

### AC5: Quality Tag Analytics
- Given ratings with quality tags, when the admin queries analytics, then the system returns per-tag frequency and average score, enabling identification of specific quality issues (e.g., lighting consistently scores low)
- Given enough ratings (N >= 50 per style), when analytics are requested, then per-style quality breakdown is included with statistical significance indicator

### AC6: Database Schema
- Given the feature is deployed, when the migration runs, then two new tables are created: `render_ratings` (id, render_id, user_id, score 1-5, tags text[], comment text, created_at, updated_at) and `nps_responses` (id, user_id, score 0-10, comment text, user_tier, total_renders int, created_at)
- Given RLS policies, when a user queries ratings, then they can only see their own ratings; admin endpoints bypass RLS with service role

## Technical Notes

### Architecture
- **Database:** Two new tables with RLS policies and indexes on render_id, user_id, created_at
- **API:** New routes under `/api/renders/:renderId/rating` and `/api/admin/analytics/`
- **UI:** Reusable `<RenderRating />` component and `<NpsSurvey />` modal component
- **Storage:** `nps_last_prompted_at` field on profiles table to track survey frequency

### Existing Foundation
- Auth middleware (Story 7.3) — user identification
- Render results (Story 7.5) — render completion events trigger rating prompt
- Profile API (Story 6.2) — extend with NPS tracking fields
- Dashboard (Story 6.4) — NPS survey trigger point
- Supabase RLS (Story 7.2) — row-level security for ratings

### Analytics Aggregation
- Use PostgreSQL aggregate functions (AVG, COUNT, percentile_cont) for real-time analytics
- NPS calculation: (% promoters [9-10] - % detractors [0-6]) * 100
- Cache analytics results in Redis (5-minute TTL) for admin dashboard performance

## Tasks
- [ ] Task 1: Create database migration for `render_ratings` and `nps_responses` tables with RLS policies
- [ ] Task 2: Add `nps_last_prompted_at` column to `profiles` table migration
- [ ] Task 3: Implement POST/GET `/api/renders/:renderId/rating` endpoints with Zod validation
- [ ] Task 4: Implement GET `/api/admin/analytics/ratings` with aggregation queries and filters
- [ ] Task 5: Implement GET `/api/admin/analytics/nps` with NPS score calculation
- [ ] Task 6: Create `<RenderRating />` React component with star rating, quality tags, and comment
- [ ] Task 7: Integrate `<RenderRating />` into render result views (staging result, chat result, editing result)
- [ ] Task 8: Create `<NpsSurvey />` modal component with 0-10 scale and comment field
- [ ] Task 9: Add NPS survey trigger logic to dashboard (3+ renders, not surveyed in 30 days)
- [ ] Task 10: Write unit tests for rating API, NPS API, and analytics aggregation
- [ ] Task 11: Write integration tests for rating flow (create, update, retrieve) and NPS flow

## Dependencies
- Story 7.2 (Database Schema) — base migration system
- Story 7.3 (Auth Middleware) — user authentication
- Story 7.5 (Render Queue) — render completion events
- Story 6.2 (Profile API) — user profile extension
- Story 6.4 (Dashboard UI) — NPS survey mount point
- Story 1.4 (Staging UI) — rating prompt integration point
- Story 2.2 (Chat UI) — rating prompt integration point
- Story 3.4 (Editing UI) — rating prompt integration point

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log

## Testing
- Unit tests for rating CRUD operations
- Unit tests for NPS score calculation (promoters/detractors/passives)
- Unit tests for analytics aggregation queries
- Integration tests for rating API endpoints (create, upsert, retrieve)
- Integration tests for NPS API endpoints (submit, dismiss, analytics)
- Component tests for `<RenderRating />` (star interaction, tag selection, submit)
- Component tests for `<NpsSurvey />` (score selection, submit, dismiss)

## File List

## QA Results
