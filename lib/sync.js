const path = require('path');
const fs = require('fs/promises');

const { get } = require('lodash');
const { globby } = require('globby');
const { default: QuickLRU } = require('quick-lru');
const { map: videoTools } = require('video-tools');
const { debug } = require('./opts.js');

const syncCache = new Map();
const metaCache = new QuickLRU({ maxSize: 10000 });

const exists = async (file) => {
  try {
    await fs.stat(file);
    return true;
  } catch (e) {
    return false;
  }
};

const getMeta = async ({ filepath, input, metadata }) => {
  const key = `${filepath}|${input}|${metadata}`;

  if (metaCache.has(key)) {
    return await metaCache.get(key);
  }

  const promise = Promise.resolve().then(async () => {
    try {
      return JSON.parse(await fs.readFile(metadata, 'utf-8')).public;
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.warn(`failed to get metadata for "${input}":`, e);
      }

      try {
        const meta = await videoTools.meta({ input });

        const public = {
          video: `/api/v1/video/${filepath}`,
          thumbnail: `/api/v1/thumbnail/${filepath}.jpg`,
          duration: +get(meta, 'format.duration', 0),
          date: get(meta, 'format.tags.creation_time', null),
        };

        await fs.writeFile(metadata, JSON.stringify({
          ...meta,
          public
        }, null, 2));

        return public;
      } catch (e) {
        console.warn(`failed to create metadata for "${input}":`, e);
        throw e;
      }
    }
  }).catch(err => {
    metaCache.delete(key);
    return Promise.reject(err);
  });

  metaCache.set(key, promise);

  return await promise;
};

const sync = async ({ input: cwd, cache }) => {
  // make sure sync is running only once, and results are re-used if
  // it is called a second time concurrently
  const key = 'sync-promise';

  if (syncCache.has(key)) {
    return await syncCache.get(key);
  }

  syncCache.set(key, Promise.resolve().then(async () => {
    const result = [];
    // optimize list for newest first, i.e. reverse alphabetical order
    const videos = (await globby('**/*.mp4', { cwd })).reverse();

    for (const video of videos) {
      const cacheDir = path.dirname(path.resolve(cache, video));
      const file = path.resolve(cwd, video);
      const metadata = path.resolve(cache, `${video}.json`);
      const thumbnail = path.resolve(cache, `${video}.jpg`);

      try {
        await fs.mkdir(cacheDir, { recursive: true });

        const meta = await getMeta({ filepath: video, input: file, metadata });
        const duration = meta.duration;
        result.push(meta);

        if (!(await exists(thumbnail))) {
          await videoTools.image({
            input: file,
            output: thumbnail,
            time: `${Math.floor(duration * 0.25)}`,
            width: 480,
            silent: !debug
          });
        }
      } catch (e) {
        console.error(`failed to process "${video}":`, e);
      }
    }

    syncCache.delete(key);

    return result;
  }));

  return await syncCache.get(key);
};

module.exports = {
  sync,
  clearCache: () => {
    metaCache.clear();
  }
};
