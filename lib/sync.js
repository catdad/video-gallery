const path = require('path');
const fs = require('fs/promises');

const { get } = require('lodash');
const { globby } = require('globby');
const { default: QuickLRU } = require('quick-lru');
const { map: videoTools } = require('video-tools');
const { directory: cwd, cache, debug } = require('./opts.js');

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

const cachePath = name => path.resolve(cache, name);

const getMeta = async ({ video, input, metadata, thumbnail }) => {
  const key = `${video}|${input}|${metadata}|${thumbnail}`;

  if (metaCache.has(key)) {
    return await metaCache.get(key);
  }

  const metaPath = cachePath(metadata);

  const promise = Promise.resolve().then(async () => {
    try {
      return JSON.parse(await fs.readFile(metaPath, 'utf-8')).public;
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.warn(`failed to get metadata for "${input}":`, e);
      }

      try {
        const meta = await videoTools.meta({ input });

        const public = {
          video: `/api/v1/video/${video}`,
          thumbnail: `/api/v1/thumbnail/${thumbnail}`,
          duration: +get(meta, 'format.duration', 0),
          date: get(meta, 'format.tags.creation_time', null),
        };

        await fs.writeFile(metaPath, JSON.stringify({
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

const sync = async () => {
  // make sure sync is running only once, and results are re-used if
  // it is called a second time concurrently
  const key = 'sync-promise';

  if (syncCache.has(key)) {
    return await syncCache.get(key);
  }

  // make sure the cache directory exists
  await fs.mkdir(cache, { recursive: true });

  syncCache.set(key, Promise.resolve().then(async () => {
    const result = [];
    // optimize list for newest first, i.e. reverse alphabetical order
    const videos = (await globby('**/*.mp4', { cwd })).reverse();

    for (const video of videos) {
      const basename = video.replace(/[\/\\ ]/g, '_');
      const metadata = `${basename}.json`;
      const thumbnail = `${basename}.jpg`;

      const videoPath = path.resolve(cwd, video);

      try {
        const meta = await getMeta({ video, input: videoPath, metadata, thumbnail });
        const duration = meta.duration;
        result.push(meta);

        const thumbPath = cachePath(thumbnail);

        if (!(await exists(thumbPath))) {
          await videoTools.image({
            input: videoPath,
            output: thumbPath,
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
