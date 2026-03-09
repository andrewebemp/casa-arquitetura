import { z } from 'zod';

const SUBSCRIPTION_TIERS = ['pro', 'business'] as const;
const PAYMENT_GATEWAYS = ['stripe', 'asaas'] as const;
const ASAAS_PAYMENT_METHODS = ['pix', 'boleto', 'credit_card'] as const;

export const checkoutSchema = z.object({
  tier: z.enum(SUBSCRIPTION_TIERS, { message: 'Tier deve ser pro ou business' }),
  gateway: z.enum(PAYMENT_GATEWAYS, { message: 'Gateway deve ser stripe ou asaas' }),
  payment_method: z.enum(ASAAS_PAYMENT_METHODS).optional(),
}).refine(
  (data) => {
    if (data.gateway === 'asaas') {
      return !!data.payment_method;
    }
    return true;
  },
  { message: 'payment_method e obrigatorio quando gateway e asaas', path: ['payment_method'] },
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
