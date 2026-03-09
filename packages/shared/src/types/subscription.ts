export type SubscriptionTier = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type PaymentGateway = 'stripe' | 'asaas';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  payment_gateway: PaymentGateway | null;
  gateway_customer_id: string | null;
  gateway_subscription_id: string | null;
  renders_used: number;
  renders_limit: number;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
