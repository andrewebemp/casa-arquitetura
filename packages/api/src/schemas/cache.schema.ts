import { z } from 'zod';

export const cacheHashParamSchema = z.object({
  hash: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid cache hash format (expected SHA-256 hex)'),
});

export type CacheHashParam = z.infer<typeof cacheHashParamSchema>;
