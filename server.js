const path = require('node:path');
const { host, port, syncPeriod, purgePeriod, ...opts } = require('./lib/opts.js');

const app = require('fastify')({ logger: opts.debug });
const staticRouter = require('@fastify/static');
const { map: videoTools } = require('video-tools');

const { initDir } = require('./lib/init.js');
const { sync, purge } = require('./lib/sync.js');

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

app.register(staticRouter, {
  root: path.resolve(process.cwd(), opts.cache),
  prefix: '/api/v1/thumbnail/',
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

app.get('/api/v1/list', async (req) => {
  return await sync({ date: req.query.date || null });
});

(async () => {
  await initDir(opts.directory);
  await initDir(opts.cache);

  await app.listen({ host, port });

  const start = Date.now();
  try {
    await sync();
  } catch (e) {
    console.error('initial sync failed', e);
  }
  console.log(`finished initial cache sync in ${Date.now() - start}ms`);

  (function periodicSync() {
    setTimeout(() => {
      const start = Date.now();
      sync().catch(err => {
        console.error('periodic sync failed', err);
      }).finally(() => {
        console.log(`finished periodic cache sync in ${Date.now() - start}ms`);
        periodicSync();
      });
    }, 1000 * 60 * syncPeriod);
  })();

  (function periodicPurge() {
    if (!purgePeriod) {
      return;
    }

    const nextPurgeTime = new Date(Date.now() + (1000 * 60 * 60 * 24));
    nextPurgeTime.setHours(3, 0, 0);

    const diff = nextPurgeTime.getTime() - Date.now();

    console.log(`scheduling next purge (older than ${purgePeriod} days) for ${nextPurgeTime}, in ${diff} milliseconds`);

    setTimeout(async () => {
      const start = Date.now();

      try {
        await purge();
        console.log(`finished purge in ${Date.now() - start}ms`);
      } catch (err) {
        console.error(`failed purge in ${Date.now() - start}:`, err);
      } finally {
        await new Promise(r => setTimeout(r, 1000));
        periodicPurge();
      }
    }, diff);
  })();
})();
