const path = require('node:path');
const app = require('fastify')({ logger: true });

const port = 3003;

app.register(require('@fastify/static'), {
  root: path.join(__dirname, 'web'),
  prefix: '/web/',
});

app.get('/api/v1/health', async () => {
  return { healthy: true };
});

app.listen({ port }).then(() => {
  console.log(`listening on port ${port}`);
  console.log(`http://localhost:${port}/web/`);
});
