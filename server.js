const path = require('node:path');
const app = require('fastify')({ logger: true });
const { map: videoTools } = require('video-tools');

const port = 3003;

app.register(require('@fastify/static'), {
  root: path.join(__dirname, 'web'),
  prefix: '/web/',
});

app.get('/api/v1/health', async () => {
  const { libVersion, ffmpegVersion, ffprobeVersion } = await videoTools.version({ silent: true });

  return { healthy: true, videoTools: libVersion, ffmpeg: ffmpegVersion, ffprobe: ffprobeVersion };
});

app.listen({ port }).then(() => {
  console.log(`listening on port ${port}`);
  console.log(`http://localhost:${port}/web/`);
});
