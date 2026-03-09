# Story 6.7 - Brazilian Payment Gateway: Asaas Integration para PIX, Boleto e Cartao Nacional

## Status: Done

## Story
As a Brazilian user, I want to pay for my Pro or Business subscription using PIX, boleto bancario, or a Brazilian credit card via Asaas so that I can subscribe without needing an international payment method, while the system seamlessly manages both Stripe and Asaas gateways.

## Acceptance Criteria

- Given an authenticated user on the Free tier, when they call `POST /subscriptions/checkout` with `tier: "pro"` and `gateway: "asaas"`, then the API creates an Asaas subscription with the correct plan value (R$ 79-149/month) and returns the payment URL for PIX, boleto, or credit card selection
- Given an authenticated user on the Free tier, when they call `POST /subscriptions/checkout` with `tier: "business"` and `gateway: "asaas"`, then the API creates an Asaas subscription with the Business plan value (R$ 299-499/month) and returns the payment URL
- Given a successful Asaas payment, when Asaas sends a `PAYMENT_CONFIRMED` webhook, then the system creates/updates the user's subscription record with `tier`, `status: "active"`, `gateway: "asaas"`, `gateway_customer_id`, `gateway_subscription_id`, `renders_limit` per tier, and resets `renders_used` to 0
- Given an active Asaas subscription, when Asaas sends a `PAYMENT_RECEIVED` webhook at period renewal, then the system updates `current_period_start`, `current_period_end`, and resets `renders_used` to 0 for the new billing cycle
- Given an active Asaas subscription, when Asaas sends a `SUBSCRIPTION_DELETED` webhook (cancellation), then the system updates the subscription status to `canceled` and downgrades the tier to `free` at period end
- Given a payment failure, when Asaas sends a `PAYMENT_OVERDUE` webhook, then the system updates subscription status to `past_due` and the user retains access for a 3-day grace period before downgrade
- Given the Asaas webhook endpoint receives a request, when the `asaas-access-token` header is validated against the configured webhook token, then only verified events are processed; invalid tokens return HTTP 400
- Given a user with an active Asaas subscription, when they call `GET /subscriptions/me`, then the response includes the gateway field as `"asaas"` and a link to manage the subscription (or instructions for PIX/boleto renewal)
- Given the checkout request, when `gateway` is `"asaas"` and `payment_method` is `"pix"`, `"boleto"`, or `"credit_card"`, then the system creates the Asaas payment with the specified billing type

## Technical Notes

### Architecture (from architecture doc)
- **Payment Gateway:** Asaas for Brazilian payments (PIX, boleto, credit card) alongside Stripe (FR-18)
- **Asaas API:** RESTful API v3 (https://docs.asaas.com) — no SDK, use HTTP client (node-fetch or axios)
- **Gateway Abstraction:** Extend existing subscription service to support dual gateway (Stripe + Asaas)
- **Webhook Processing:** Asaas webhooks processed idempotently using same `webhook_events` table (Story 6.3)
- **PIX:** Instant payment — Asaas generates QR code and copy-paste code
- **Boleto:** Bank slip — Asaas generates boleto URL with barcode
- **Credit Card:** Standard Brazilian credit card — processed via Asaas tokenization

### Existing Foundation
- `subscriptions` table with `gateway` column already supports multiple gateways (Story 7.2)
- `webhook_events` table for idempotency (Story 6.3)
- Subscription service with gateway parameter in checkout (Story 6.3)
- Subscription schemas with `gateway` field validation (Story 6.3)
- Tier limits and constants (packages/shared/src/constants/tiers.ts)
- Auth middleware and error handling (Story 7.3)

### Asaas Integration Points
- `POST /v3/customers` — create Asaas customer from user profile
- `POST /v3/subscriptions` — create recurring subscription with billing type
- `GET /v3/subscriptions/{id}` — retrieve subscription status
- `DELETE /v3/subscriptions/{id}` — cancel subscription
- `POST /v3/pix/qrCodes/static` — generate PIX QR code for payment
- Webhook events: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`, `SUBSCRIPTION_UPDATED`

### Environment Variables (new)
- `ASAAS_API_KEY` — Asaas API key (sandbox or production)
- `ASAAS_WEBHOOK_TOKEN` — Asaas webhook authentication token
- `ASAAS_API_URL` — Asaas API base URL (sandbox: https://sandbox.asaas.com/api, production: https://api.asaas.com/api)
- `ASAAS_PRO_VALUE` — Monthly value for Pro tier in BRL (e.g., "79.00")
- `ASAAS_BUSINESS_VALUE` — Monthly value for Business tier in BRL (e.g., "299.00")

## Tasks
- [x] Task 1: Add Asaas env vars to `packages/api/src/config/env.ts` and `.env.example`
- [x] Task 2: Create Asaas HTTP client (`packages/api/src/lib/asaas.ts`) — typed HTTP wrapper for Asaas API v3 with error handling, retry logic, and sandbox/production support
- [x] Task 3: Create Asaas types (`packages/shared/src/types/asaas.ts`) — TypeScript interfaces for Asaas API requests/responses (Customer, Subscription, Payment, Webhook events)
- [x] Task 4: Extend subscription schemas (`packages/api/src/schemas/subscription.schema.ts`) — add `"asaas"` to gateway enum, add `payment_method` field (pix | boleto | credit_card) required when gateway is asaas
- [x] Task 5: Create Asaas customer service (`packages/api/src/services/asaas-customer.service.ts`) — findOrCreate Asaas customer from user profile (name, email, CPF/CNPJ)
- [x] Task 6: Extend subscription service (`packages/api/src/services/subscription.service.ts`) — add Asaas checkout flow: create customer, create subscription with billing type, return payment URL/PIX QR code
- [x] Task 7: Create Asaas webhook handlers (`packages/api/src/services/asaas-webhook-handlers.ts`) — handle PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, SUBSCRIPTION_DELETED with idempotency
- [x] Task 8: Create Asaas webhook route (`packages/api/src/routes/asaas-webhook.routes.ts`) — `POST /webhooks/asaas` with token verification and event routing
- [x] Task 9: Register Asaas webhook route in `server.ts`
- [x] Task 10: Update `.env.example` with all Asaas env vars
- [x] Task 11: Write unit tests for Asaas HTTP client (API calls, error handling, retry)
- [x] Task 12: Write unit tests for Asaas customer service (create, find existing, error cases)
- [x] Task 13: Write unit tests for extended subscription service (Asaas checkout flow for PIX, boleto, credit card)
- [x] Task 14: Write unit tests for Asaas webhook handlers (each event type, idempotency, invalid token rejection)
- [x] Task 15: Write unit tests for Asaas webhook route (token verification, event processing)
- [x] Task 16: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.2 (Database Schema — subscriptions table with gateway column) Done
- Story 7.3 (API Infrastructure — auth middleware, error handling) Done
- Story 6.1 (Auth Routes — user authentication) Done
- Story 6.3 (Stripe Integration — subscription service, webhook infrastructure) Done
- Story 7.5 (Render Job Queue — quota service reads subscription tier) Done

## Dev Agent Record
### Implementation Plan
Dual-gateway architecture extending existing Stripe subscription infrastructure with Asaas for Brazilian payments (PIX, boleto, credit card).

### Debug Log
- Fixed typecheck: `profiles` table -> `user_profiles` + `supabaseAdmin.auth.admin.getUserById()` for email
- Fixed existing subscription.routes.test.ts: updated mock expectations for new 4-param `createCheckoutSession` and `payment_gateway` field requirement for portal URL
- Added ASAAS env vars to all existing test mocks to prevent module load failures

### Change Log
- 2026-03-09: Implemented complete Asaas integration (Story 6.7)

## Testing
- Unit tests for Asaas HTTP client (API call mocking, error scenarios, retry behavior) - 9 tests
- Unit tests for Asaas customer service (create customer, find existing, email fallback, error cases) - 5 tests
- Unit tests for subscription service Asaas flow (checkout PIX, boleto, credit card, tier validation) - 7 tests
- Unit tests for Asaas webhook handlers (PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, SUBSCRIPTION_DELETED, idempotency) - 7 tests
- Unit tests for Asaas webhook route (token auth, event processing, invalid token rejection) - 7 tests
- All Asaas API calls mocked in tests (no real Asaas calls in CI)
- Verify existing Stripe tests still pass after subscription service extension - PASSED (689 total tests)

## File List
- `packages/api/src/config/env.ts` (modified) — Added ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN, ASAAS_API_URL, ASAAS_PRO_VALUE, ASAAS_BUSINESS_VALUE
- `packages/api/src/lib/asaas.ts` (new) — Asaas HTTP client with retry logic, typed methods for customers, subscriptions, payments
- `packages/shared/src/types/asaas.ts` (existing) — Asaas TypeScript interfaces (already existed from previous work)
- `packages/shared/src/types/index.ts` (existing) — Exports Asaas types (already configured)
- `packages/api/src/schemas/subscription.schema.ts` (modified) — Added 'asaas' to gateway enum, payment_method field with refinement
- `packages/api/src/services/asaas-customer.service.ts` (new) — findOrCreate Asaas customer from Supabase Auth user
- `packages/api/src/services/subscription.service.ts` (modified) — Added Asaas checkout flow, gateway parameter in activateSubscription
- `packages/api/src/services/asaas-webhook-handlers.ts` (new) — Handlers for PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, SUBSCRIPTION_DELETED
- `packages/api/src/routes/asaas-webhook.routes.ts` (new) — POST /webhooks/asaas with token verification
- `packages/api/src/routes/subscription.routes.ts` (modified) — Pass gateway and payment_method to checkout, Asaas-aware /me endpoint
- `packages/api/src/server.ts` (modified) — Registered asaasWebhookRoutes
- `.env.example` (modified) — Added ASAAS_WEBHOOK_TOKEN, ASAAS_API_URL, ASAAS_PRO_VALUE, ASAAS_BUSINESS_VALUE
- `packages/api/src/__tests__/asaas-client.test.ts` (new) — 9 tests for Asaas HTTP client
- `packages/api/src/__tests__/asaas-customer.service.test.ts` (new) — 5 tests for customer service
- `packages/api/src/__tests__/subscription-asaas.service.test.ts` (new) — 7 tests for Asaas checkout flow
- `packages/api/src/__tests__/asaas-webhook-handlers.test.ts` (new) — 7 tests for webhook handlers
- `packages/api/src/__tests__/asaas-webhook.routes.test.ts` (new) — 7 tests for webhook route
- `packages/api/src/__tests__/subscription.service.test.ts` (modified) — Added ASAAS env vars to mocks
- `packages/api/src/__tests__/subscription.routes.test.ts` (modified) — Updated for new 4-param checkout and payment_gateway field

## QA Results
