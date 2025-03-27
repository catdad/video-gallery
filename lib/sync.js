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

const getResources = video => {
  const basename = video.replace(/[\/\\ ]/g, '_');
  const metadata = `${basename}.json`;
  const thumbnail = `${basename}.jpg`;

  return {
    basename, metadata, thumbnail, video,
    videoPath: path.resolve(cwd, video),
    metaPath: path.resolve(cache, metadata),
    thumbPath: path.resolve(cache, thumbnail),
  };
};

const getMeta = async ({ video }) => {
  const key = `${video}`;

  if (metaCache.has(key)) {
    return await metaCache.get(key);
  }

  const { thumbnail, metaPath, videoPath: input } = getResources(video);

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

const ensureThumbnail = async ({ video }) => {
  const { thumbPath, videoPath } = getResources(video);

  if (await exists(thumbPath)) {
    return;
  }

  const { duration } = await getMeta({ video });

  await videoTools.image({
    input: videoPath,
    output: thumbPath,
    time: `${Math.floor(duration * 0.25)}`,
    width: 480,
    silent: !debug
  });
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
      try {
        const meta = await getMeta({ video });
        result.push(meta);

        await ensureThumbnail({ video });
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
