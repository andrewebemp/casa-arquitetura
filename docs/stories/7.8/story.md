# Story 7.8 - API Rate Limiting: Per-Tier Request Throttling via Redis

## Status: Draft

## Story
As a platform operator, I want the API to enforce per-tier rate limiting (Free: 10 req/min, Pro: 60 req/min, Business: 120 req/min) via Redis so that the system is protected from abuse while providing fair access based on subscription level.

## Acceptance Criteria

- Given an unauthenticated request to a public endpoint (e.g., `/health`, `/api/share/:token`), when the client IP exceeds 30 requests per minute, then the API returns HTTP 429 with error code `RATE_LIMIT_EXCEEDED`, a `Retry-After` header indicating seconds until reset, and body including `limit`, `remaining`, and `resetAt` fields
- Given an authenticated user on the Free tier, when they exceed 10 API requests per minute across all authenticated endpoints, then the API returns HTTP 429 with error code `RATE_LIMIT_EXCEEDED`, `Retry-After` header, and body with tier-specific limit info
- Given an authenticated user on the Pro tier, when they exceed 60 API requests per minute across all authenticated endpoints, then the API returns HTTP 429 with the same structured response
- Given an authenticated user on the Business tier, when they exceed 120 API requests per minute across all authenticated endpoints, then the API returns HTTP 429 with the same structured response
- Given any request within the rate limit, when the response is sent, then headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` are included in every response
- Given the Redis connection is unavailable, when a request is received, then the rate limiter fails open (allows the request) and logs a warning, ensuring availability is not affected by Redis outages
- Given a webhook endpoint (`/webhooks/stripe`, `/webhooks/asaas`), when a request is received, then rate limiting is NOT applied (webhooks are exempt)

## Technical Notes

### Architecture (from architecture doc)
- **Rate Limiting:** Per tier via Redis: Free (10 req/min), Pro (60 req/min), Business (120 req/min) — Ref: NFR-10
- **Algorithm:** Sliding window counter using Redis MULTI/EXEC for atomicity
- **Key Pattern:** `ratelimit:{userId}:{windowMinute}` for authenticated, `ratelimit:ip:{ip}:{windowMinute}` for anonymous
- **Middleware Integration:** Fastify `onRequest` hook, runs AFTER auth middleware to resolve tier
- **Fail-Open:** If Redis is down, allow requests (availability over strictness)

### Existing Foundation
- Redis client singleton at `packages/api/src/lib/redis.ts` (Story 7.5)
- Auth middleware resolves `request.user` with JWT token (Story 7.3)
- Subscription service provides tier lookup via `getByUserId` (Story 6.3)
- Error handler supports `AppError` with custom codes (Story 7.3)
- `TIER_LIMITS` constants in `packages/shared/src/constants/tiers.ts` (Story 7.2)
- Architecture specifies `middleware/rate-limit.middleware.ts` path

### Rate Limit Tiers
| Tier | Requests/Min | Key Strategy |
|------|-------------|--------------|
| Anonymous | 30 | IP-based |
| Free | 10 | User ID |
| Pro | 60 | User ID |
| Business | 120 | User ID |

### Environment Variables
- No new env vars needed — uses existing `REDIS_URL`

## Tasks
- [ ] Task 1: Add rate limit constants to `packages/shared/src/constants/tiers.ts` — `RATE_LIMITS` map per tier (free: 10, pro: 60, business: 120) and anonymous (30)
- [ ] Task 2: Create rate limit service (`packages/api/src/services/rate-limit.service.ts`) — sliding window counter with Redis INCR + EXPIRE, check/increment, get remaining, fail-open on Redis error
- [ ] Task 3: Create rate limit middleware (`packages/api/src/middleware/rate-limit.middleware.ts`) — Fastify `preHandler` hook that resolves user tier from subscription, checks rate limit, sets response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`), returns 429 with `Retry-After` when exceeded
- [ ] Task 4: Register rate limit middleware globally in `server.ts` with webhook route exemptions (`/webhooks/*`)
- [ ] Task 5: Write unit tests for rate limit service (increment, window expiry, limit check, Redis failure fail-open)
- [ ] Task 6: Write unit tests for rate limit middleware (anonymous/free/pro/business limits, 429 response format, header injection, webhook exemption, Redis down scenario)
- [ ] Task 7: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.2 (Database Schema — subscriptions table with tier column) Done
- Story 7.3 (API Infrastructure — auth middleware, error handler) Done
- Story 7.5 (Render Job Queue — Redis client singleton) Done
- Story 6.3 (Subscription Service — tier lookup) Done

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log

## Testing
- Unit tests for rate limit service (sliding window increment, limit exceeded detection, window reset, Redis MULTI/EXEC, fail-open on Redis error)
- Unit tests for rate limit middleware (per-tier limits, anonymous IP-based limiting, response headers on every request, 429 format with Retry-After, webhook exemption)
- Integration pattern: mock Redis for isolated testing, mock subscription service for tier resolution
- Verify existing tests still pass after middleware registration

## File List

## QA Results
