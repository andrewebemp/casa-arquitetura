import Fastify from 'fastify';

const server = Fastify({ logger: true });

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  const port = parseInt(process.env.API_PORT || '3001', 10);
  const host = process.env.API_HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`API server running on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
