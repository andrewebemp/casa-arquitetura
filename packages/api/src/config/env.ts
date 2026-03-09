import { cleanEnv, str, port, url } from 'envalid';

export const env = cleanEnv(process.env, {
  SUPABASE_URL: url({ desc: 'Supabase project URL' }),
  SUPABASE_ANON_KEY: str({ desc: 'Supabase anonymous/public key' }),
  SUPABASE_SERVICE_ROLE_KEY: str({ desc: 'Supabase service role key (admin)' }),
  REDIS_URL: url({ desc: 'Redis connection URL' }),
  PORT: port({ default: 3001, desc: 'API server port' }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  CORS_ORIGINS: str({ default: 'http://localhost:3000', desc: 'Comma-separated allowed origins' }),
  STRIPE_SECRET_KEY: str({ desc: 'Stripe API secret key' }),
  STRIPE_WEBHOOK_SECRET: str({ desc: 'Stripe webhook signing secret' }),
  STRIPE_PRO_PRICE_ID: str({ desc: 'Stripe Price ID for Pro tier' }),
  STRIPE_BUSINESS_PRICE_ID: str({ desc: 'Stripe Price ID for Business tier' }),
});
