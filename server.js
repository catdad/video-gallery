const path = require('node:path');
const app = require('fastify')({ logger: true });
const staticRouter = require('@fastify/static');
const { map: videoTools } = require('video-tools');
const { globby } = require('globby');

const { host, port, ...opts } = require('./lib/opts.js');
const { initDir } = require('./lib/init.js');
const { sync } = require('./lib/sync.js');

app.register(staticRouter, {
  root: path.resolve(__dirname, 'web'),
  prefix: '/web/',
});

app.register(staticRouter, {
  root: path.resolve(process.cwd(), opts.directory),
  prefix: '/api/v1/video/',
  // this can only exist once, so all other register calls need to have false
  decorateReply: false
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

app.get('/api/v1/list', async () => {
  return await list(opts.directory);
});

(async () => {
  await initDir(opts.directory);
  await initDir(opts.cache);

  await app.listen({ host, port });

  try {
    await sync({ input: opts.directory, cache: opts.cache });
  } catch (e) {
    console.error('initial sync failed', e);
  }
})();
