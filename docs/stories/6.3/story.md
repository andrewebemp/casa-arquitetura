# Story 6.3 - Subscription & Payment API: Stripe Integration, Tier Management e Webhooks

## Status: Done

## Story
As a user, I want to subscribe to a paid plan (Pro or Business) via Stripe so that I can access higher render limits, HD resolution, and watermark-free images, with the system automatically managing my subscription lifecycle and tier enforcement.

## Acceptance Criteria

- Given an authenticated user on the Free tier, when they call `POST /subscriptions/checkout` with `tier: "pro"` and `gateway: "stripe"`, then the API creates a Stripe Checkout Session with the correct price ID and returns the checkout URL for client redirect
- Given an authenticated user on the Free tier, when they call `POST /subscriptions/checkout` with `tier: "business"` and `gateway: "stripe"`, then the API creates a Stripe Checkout Session with the Business price ID and returns the checkout URL
- Given a successful Stripe checkout, when Stripe sends a `checkout.session.completed` webhook, then the system creates/updates the user's subscription record with `tier`, `status: "active"`, `gateway_customer_id`, `gateway_subscription_id`, `renders_limit` per tier, and resets `renders_used` to 0
- Given an active paid subscription, when Stripe sends an `invoice.paid` webhook at period renewal, then the system updates `current_period_start`, `current_period_end`, and resets `renders_used` to 0 for the new billing cycle
- Given an active paid subscription, when Stripe sends a `customer.subscription.deleted` webhook (cancellation), then the system updates the subscription status to `canceled` and downgrades the tier to `free` with the Free tier limits at period end
- Given a payment failure, when Stripe sends an `invoice.payment_failed` webhook, then the system updates subscription status to `past_due` and the user retains access for a 3-day grace period before downgrade
- Given an authenticated user with an active paid subscription, when they call `GET /subscriptions/me`, then the API returns their current subscription details including tier, status, renders used/limit, period dates, and a Stripe Customer Portal URL for self-service management
- Given an authenticated user with an active subscription, when they call `POST /subscriptions/portal`, then the API creates a Stripe Billing Portal session and returns the URL where users can update payment method, view invoices, or cancel
- Given the webhook endpoint receives a request, when the `Stripe-Signature` header is validated against the webhook secret, then only verified events are processed; invalid signatures return HTTP 400

## Technical Notes

### Architecture (from architecture doc)
- **Payment Gateway:** Stripe for international payments (FR-18); Asaas integration deferred to future story
- **Subscription Model:** 3 tiers — Free (3 renders/month, watermark), Pro (100 renders/month), Business (500 renders/month) (FR-16)
- **Webhook Processing:** Stripe webhooks processed idempotently with event ID deduplication
- **Customer Portal:** Stripe Billing Portal for self-service subscription management
- **RLS:** Subscription records protected by Supabase RLS — users can only read their own subscription

### Existing Foundation
- `subscriptions` table already exists with all required columns (Story 7.2)
- `Subscription` type defined in `packages/shared/src/types/subscription.ts`
- `TIER_LIMITS` constants in `packages/shared/src/constants/tiers.ts`
- Quota service already reads subscription tier for render limits (Story 7.5)
- Auth middleware ready (Story 7.3)
- Fastify server with route registration pattern (Story 7.3)

### Stripe Integration Points
- `stripe.checkout.sessions.create()` — create checkout for new subscriptions
- `stripe.billingPortal.sessions.create()` — customer self-service portal
- `stripe.webhooks.constructEvent()` — verify webhook signatures
- Webhook events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`

### Environment Variables (new)
- `STRIPE_SECRET_KEY` — Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRO_PRICE_ID` — Stripe Price ID for Pro tier
- `STRIPE_BUSINESS_PRICE_ID` — Stripe Price ID for Business tier

## Tasks
- [x] Task 1: Add `stripe` dependency to `packages/api/package.json` and add Stripe env vars to `packages/api/src/config/env.ts`
- [x] Task 2: Create Stripe client (`packages/api/src/lib/stripe.ts`) — singleton Stripe SDK instance with API version lock
- [x] Task 3: Create subscription service (`packages/api/src/services/subscription.service.ts`) — getByUserId, createCheckoutSession, createPortalSession, handleWebhookEvent, updateFromStripe, downgradeToFree
- [x] Task 4: Create subscription schemas (`packages/api/src/schemas/subscription.schema.ts`) — Zod schemas for checkout request (tier + gateway), webhook payload, subscription response
- [x] Task 5: Create subscription routes (`packages/api/src/routes/subscription.routes.ts`) — `POST /subscriptions/checkout`, `GET /subscriptions/me`, `POST /subscriptions/portal`
- [x] Task 6: Create Stripe webhook route (`packages/api/src/routes/webhook.routes.ts`) — `POST /webhooks/stripe` with raw body parsing, signature verification, and idempotent event processing
- [x] Task 7: Create webhook event handlers (`packages/api/src/services/webhook-handlers.ts`) — handle checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.deleted with idempotency checks
- [x] Task 8: Register subscription and webhook routes in `server.ts`
- [x] Task 9: Create `.env.example` entries for Stripe env vars
- [x] Task 10: Write unit tests for subscription service (checkout creation, portal creation, tier transitions, webhook handling, idempotency)
- [x] Task 11: Write unit tests for subscription routes (auth, validation, checkout flow, webhook signature verification)
- [x] Task 12: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.2 (Database Schema — subscriptions table) ✅
- Story 7.3 (API Infrastructure — auth middleware, error handling) ✅
- Story 6.1 (Auth Routes — user authentication) ✅
- Story 7.5 (Render Job Queue — quota service reads subscription tier) ✅

## Dev Agent Record
### Implementation Plan
Implemented Stripe subscription lifecycle: checkout session creation, billing portal, webhook processing with idempotent event handlers, and tier management (activate, renew, past_due, downgrade).

### Debug Log
- Fixed Stripe API version from '2025-01-27.acacia' to '2025-02-24.acacia' (stripe@17.7.0)
- Added explicit return type `SubscriptionRow | null` on `getByUserId` to fix Supabase type inference
- Updated env.test.ts to include new Stripe env vars

### Change Log
- 2026-03-09: Story 6.3 implemented by @dev (Dex)

## Testing
- Unit tests for Stripe client initialization and config validation
- Unit tests for subscription service (create checkout, portal session, get subscription, webhook processing)
- Unit tests for webhook handlers (each event type, idempotency, invalid signature rejection)
- Unit tests for subscription routes (auth required, checkout validation, webhook raw body parsing)
- Unit tests for tier transition logic (free→pro, free→business, paid→canceled→free, payment failure grace period)
- All Stripe API calls mocked in tests (no real Stripe calls in CI)
- Integration pattern: mock Stripe SDK, mock Supabase for isolated testing

## File List
- `packages/api/package.json` — Added stripe@^17.0.0 dependency
- `packages/api/src/config/env.ts` — Added STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_BUSINESS_PRICE_ID
- `packages/api/src/lib/stripe.ts` — NEW: Stripe SDK singleton client
- `packages/api/src/schemas/subscription.schema.ts` — NEW: Zod schemas for checkout input
- `packages/api/src/services/subscription.service.ts` — NEW: Subscription service (CRUD, checkout, portal, tier management)
- `packages/api/src/services/webhook-handlers.ts` — NEW: Webhook event handlers with idempotency
- `packages/api/src/routes/subscription.routes.ts` — NEW: Subscription API routes
- `packages/api/src/routes/webhook.routes.ts` — NEW: Stripe webhook endpoint
- `packages/api/src/server.ts` — Registered subscription and webhook routes
- `packages/shared/src/types/database.types.ts` — Added webhook_events table type
- `supabase/migrations/014_webhook_events.sql` — NEW: Webhook events idempotency table
- `.env.example` — Added STRIPE_PRO_PRICE_ID, STRIPE_BUSINESS_PRICE_ID
- `packages/api/src/__tests__/subscription.service.test.ts` — NEW: 12 tests
- `packages/api/src/__tests__/subscription.routes.test.ts` — NEW: 15 tests
- `packages/api/src/__tests__/webhook-handlers.test.ts` — NEW: 5 tests
- `packages/api/src/__tests__/env.test.ts` — Updated to include Stripe env vars

## QA Results
- `npm run lint` ✅ — 0 errors
- `npm run typecheck` ✅ — 0 errors
- `npm test` ✅ — 270 tests passed, 0 failed (28 test files)
