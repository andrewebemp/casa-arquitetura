import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

// Use createRequire from monorepo root to resolve esbuild
// (pnpm strict hoisting means esbuild may not be in packages/api/node_modules)
const rootRequire = createRequire(resolve(rootDir, 'package.json'));
const { build } = rootRequire('esbuild');

await build({
  entryPoints: [resolve(__dirname, 'api/_entry.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: resolve(__dirname, 'api/index.js'),
  external: [
    'sharp',
    'ioredis',
    'bullmq',
    'pino',
    'pino-pretty',
  ],
  sourcemap: false,
  minify: false,
  alias: {
    '@decorai/shared': resolve(__dirname, '../shared/src/index.ts'),
  },
});

console.log('API bundled successfully for Vercel');
