-- ============================================================
-- DecorAI Brasil — Migration 008: Subscriptions
-- Ref: FR-16, FR-17, FR-18
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  payment_gateway TEXT CHECK (payment_gateway IN ('stripe', 'asaas')),
  gateway_customer_id TEXT,
  gateway_subscription_id TEXT,
  renders_used INTEGER NOT NULL DEFAULT 0,
  renders_limit INTEGER NOT NULL DEFAULT 3,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Updates gerenciados por service role (webhooks)
