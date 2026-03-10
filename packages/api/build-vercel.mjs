import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(__dirname, 'api/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: resolve(__dirname, 'api/index.js'),
  external: [
    // Keep native modules external (they'll be in node_modules)
    'sharp',
    'ioredis',
    'bullmq',
    'pino',
    'pino-pretty',
  ],
  sourcemap: false,
  minify: false,
  // Resolve workspace packages from source (esbuild handles TS natively)
  alias: {
    '@decorai/shared': resolve(__dirname, '../shared/src/index.ts'),
  },
});

console.log('API bundled successfully for Vercel');
