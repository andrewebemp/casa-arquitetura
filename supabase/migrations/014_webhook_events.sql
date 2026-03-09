-- ============================================================
-- DecorAI Brasil — Migration 014: Webhook Events (Idempotency)
-- Ref: Story 6.3 — Stripe webhook deduplication
-- ============================================================

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
