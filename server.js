const path = require('node:path');
const app = require('fastify')({ logger: true });
const { map: videoTools } = require('video-tools');

const { port, ...opts } = require('./lib/opts.js');

app.register(require('@fastify/static'), {
  root: path.resolve(__dirname, 'web'),
  prefix: '/web/',
});

app.get('/', (req, reply) => {
  reply.redirect('web/');
});

app.get('/api/v1/health', async (req, reply) => {
  try {
    const { libVersion, ffmpegVersion, ffprobeVersion } = await videoTools.version({ silent: true });

    return {
      healthy: true,
      videoTools: libVersion,
      ffmpeg: ffmpegVersion,
      ffprobe: ffprobeVersion
    };
  } catch (e) {
    reply.status(500);

    return {
      healthy: false,
      error: 'message' in e ? e.message : e
    };
  }
});

app.listen({ port }).then(() => {
  console.log(`listening at http://localhost:${port}/`);
});
