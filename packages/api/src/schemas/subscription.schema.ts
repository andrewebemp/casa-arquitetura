import { z } from 'zod';

const SUBSCRIPTION_TIERS = ['pro', 'business'] as const;
const PAYMENT_GATEWAYS = ['stripe'] as const;

export const checkoutSchema = z.object({
  tier: z.enum(SUBSCRIPTION_TIERS, { message: 'Tier deve ser pro ou business' }),
  gateway: z.enum(PAYMENT_GATEWAYS, { message: 'Gateway deve ser stripe' }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
