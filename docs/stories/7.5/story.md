# Story 7.5 - Render Job Queue, Quota Check e Progresso em Tempo Real

## Status: Done

## Story
As a developer, I want a render job queue with real-time progress feedback so that render requests are processed asynchronously with WebSocket status updates, enabling the AI generation pipeline to scale independently.

## Acceptance Criteria

- Given a project with uploaded images, when the user submits a render request via `POST /projects/:id/generate`, then a render job is created in the `render_jobs` table with status `queued` and enqueued in BullMQ with priority based on user tier (Business=1, Pro=5, Free=10)
- Given a render job is queued, when the BullMQ worker picks it up, then the job status transitions through `queued → processing → completed/failed` and each transition is broadcast via Supabase Realtime on channel `render:${jobId}`
- Given a user on the Free tier with 3 renders used this month, when they submit a new render request, then the API returns HTTP 429 with error code `QUOTA_EXCEEDED` and message indicating remaining quota is 0
- Given a user with an active render job, when they call `GET /projects/:id/render-jobs`, then they receive a list of all render jobs for that project ordered by `created_at` desc, including current status and progress percentage
- Given a render job fails after processing, when the error is captured, then the job status is set to `failed`, `error_message` is populated, `attempts` is incremented, and the failure is broadcast via Realtime
- Given a render job is in `queued` or `processing` status, when the user calls `POST /render-jobs/:id/cancel`, then the job status is set to `canceled` and the BullMQ job is removed from the queue
- Given the Redis connection is unavailable, when a render request is submitted, then the API returns HTTP 503 with error code `QUEUE_UNAVAILABLE` and logs the connection error

## Technical Notes

### Architecture (from architecture doc)
- **Queue:** BullMQ backed by Upstash Redis (`REDIS_URL` already in env.ts)
- **Worker:** BullMQ worker in `packages/api/src/queue/` — skeleton only (delegates to AI pipeline HTTP client in future stories)
- **Realtime:** Supabase Realtime channels for WebSocket broadcast (no custom WS server)
- **Priority:** Job priority derived from user's subscription tier
- **Quota:** Monthly render count checked against tier limits (from `packages/shared/src/constants/tiers.ts`)

### Existing Foundation
- `RenderJob` type already defined in `packages/shared/src/types/render-job.ts`
- `render_jobs` table already exists with RLS policies (Story 7.2)
- `REDIS_URL` already configured in `packages/api/src/config/env.ts`
- Auth middleware and validation middleware ready (Story 7.3)
- Project CRUD and storage service ready (Story 7.4)

## Tasks
- [x] Task 1: Create Redis client (`packages/api/src/lib/redis.ts`) using ioredis with Upstash connection, health check method, and graceful shutdown
- [x] Task 2: Create quota service (`packages/api/src/services/quota.service.ts`) — check monthly render count against tier limits, return remaining quota
- [x] Task 3: Create render service (`packages/api/src/services/render.service.ts`) — create render job in DB, enqueue in BullMQ, get job status, cancel job
- [x] Task 4: Create BullMQ render queue (`packages/api/src/queue/render.queue.ts`) — queue definition, job options by tier, concurrency config
- [x] Task 5: Create BullMQ render worker (`packages/api/src/queue/render.worker.ts`) — skeleton worker that transitions job status and broadcasts via Realtime (actual AI processing delegated to future stories)
- [x] Task 6: Create render events broadcaster (`packages/api/src/queue/render.events.ts`) — broadcast job status changes to Supabase Realtime channel `render:${jobId}`
- [x] Task 7: Create render schemas (`packages/api/src/schemas/render.schema.ts`) — Zod schemas for generate request, job params, job response
- [x] Task 8: Create render routes (`packages/api/src/routes/render.routes.ts`) — `POST /projects/:id/generate`, `GET /projects/:id/render-jobs`, `POST /render-jobs/:id/cancel`
- [x] Task 9: Register render routes in server.ts
- [x] Task 10: Write unit tests for quota service, render service, render queue, render worker, render events, render routes
- [x] Task 11: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.2 (Database Schema — render_jobs table) ✅
- Story 7.3 (API Infrastructure — auth, validation, error handling) ✅
- Story 7.4 (Project CRUD — project ownership verification) ✅
- Story 6.1 (Auth Routes — user authentication) ✅

## Dev Agent Record
### Implementation Plan
Implemented all 11 tasks sequentially with quality gates validation.

### Debug Log
- Fixed TDZ issues in vitest mocks by using `vi.hoisted()` for variables referenced in `vi.mock` factories
- Fixed render_jobs table access: no `user_id` column — ownership verified through project relationship
- Fixed Supabase mock chain for `.in().gte().in()` pattern in quota service tests

### Change Log
- 2026-03-09: Implemented complete render job queue system with BullMQ, quota enforcement, and Supabase Realtime broadcast

## Testing
- Unit tests for Redis client (connection, health check, error handling)
- Unit tests for quota service (within limits, exceeded, edge cases per tier)
- Unit tests for render service (create job, cancel job, list jobs, status transitions)
- Unit tests for render queue (enqueue, priority mapping, job options)
- Unit tests for render worker (status transitions, error handling, Realtime broadcast)
- Unit tests for render routes (auth, validation, quota check, success/error responses)
- Integration pattern: mock Supabase, mock Redis/BullMQ for isolated testing

## File List
- `packages/api/package.json` (modified — added bullmq, ioredis dependencies)
- `packages/api/src/lib/redis.ts` (new)
- `packages/api/src/services/quota.service.ts` (new)
- `packages/api/src/services/render.service.ts` (new)
- `packages/api/src/queue/render.queue.ts` (new)
- `packages/api/src/queue/render.worker.ts` (new)
- `packages/api/src/queue/render.events.ts` (new)
- `packages/api/src/schemas/render.schema.ts` (new)
- `packages/api/src/routes/render.routes.ts` (new)
- `packages/api/src/server.ts` (modified — register render routes)
- `packages/api/src/__tests__/redis.test.ts` (new)
- `packages/api/src/__tests__/quota.service.test.ts` (new)
- `packages/api/src/__tests__/render.service.test.ts` (new)
- `packages/api/src/__tests__/render.queue.test.ts` (new)
- `packages/api/src/__tests__/render.worker.test.ts` (new)
- `packages/api/src/__tests__/render.events.test.ts` (new)
- `packages/api/src/__tests__/render.routes.test.ts` (new)

## QA Results

### Verdict: PASS

**Reviewed by:** Quinn (@qa)
**Date:** 2026-03-09
**Test Suite:** 229 tests passing (24 test files), 0 failures

---

### Phase 1: Code Quality — PASS
- Clean, well-structured code following project patterns (Fastify + service layer + queue layer)
- Consistent naming conventions (kebab-case files, camelCase variables)
- Proper separation between redis client, queue, worker, events, service, routes
- Singleton patterns for Redis client and BullMQ queue with lazy initialization

### Phase 2: Test Coverage — PASS
- 7 test files covering all new modules (48 tests specific to Story 7.5)
- Edge cases covered: Redis down, quota exceeded, project not found, job not cancelable, invalid UUID, missing auth

### Phase 3: Acceptance Criteria — PASS
- All 7 acceptance criteria verified and met

### Phase 4: Regressions — PASS
- All 229 tests pass, no existing tests broken

### Phase 5: Performance — PASS
- Efficient count query with `head: true`, exponential backoff, lazy connect, queue auto-cleanup

### Phase 6: Security — PASS
- Auth on all routes, project ownership via RLS, UUID validation, no injection vectors

### Phase 7-10: Documentation, Tech Debt, Architecture — PASS
- Story fully updated, no hacks, proper separation of concerns

### Quality Gates
| Gate | Result |
|------|--------|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS (229/229) |
