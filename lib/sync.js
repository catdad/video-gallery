const path = require('path');
const fs = require('fs/promises');

const { get } = require('lodash');
const dayjs = require('dayjs');
const { globby } = require('globby');
const { default: QuickLRU } = require('quick-lru');
const { map: videoTools } = require('video-tools');
const { directory: cwd, cache, filter: nameMap, debug, purgePeriod } = require('./opts.js');

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

// this should be local to the server time
const formatDate = date => dayjs(date).format('YYYY-MM-DD');

const getResources = video => {
  const basename = video.replace(/[\/\\ ]/g, '_');
  const metadata = `${basename}.json`;
  const thumbnail = `${basename}.jpg`;

  const cameraName = (Object.entries(nameMap).find(([filter]) => video.indexOf(filter) === 0) || [])[1];

  return {
    basename, metadata, thumbnail, video,
    videoPath: path.resolve(cwd, video),
    metaPath: path.resolve(cache, metadata),
    thumbPath: path.resolve(cache, thumbnail),
    cameraName,
    thumbnail,
  };
};

const readMetadata = async ({ video }) => {
  const key = `${video}`;

  if (metaCache.has(key)) {
    return await metaCache.get(key);
  }

  const { metaPath, videoPath } = getResources(video);

  const promise = Promise.resolve().then(async () => {
    try {
      return JSON.parse(await fs.readFile(metaPath, 'utf-8')).public;
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.warn(`failed to get metadata for "${videoPath}":`, e);
      }

      try {
        const meta = await videoTools.meta({ input: videoPath });

        const public = {
          duration: +get(meta, 'format.duration', 0),
          date: get(meta, 'format.tags.creation_time', null),
        };

        if (!public.date) {
          const { birthtime } = await fs.stat(videoPath);

          // on rare occasions when this is not available, it may be set to 1970-01-01
          // we just want to ignore that
          if (birthtime && birthtime.getTime && birthtime.getTime() > 0) {
            public.date = new Date(birthtime);
          }
        }

        await fs.writeFile(metaPath, JSON.stringify({
          ...meta,
          public
        }, null, 2));

        return public;
      } catch (e) {
        console.warn(`failed to create metadata for "${videoPath}":`, e);
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

const getMeta = async ({ video }) => {
  const { thumbnail, cameraName } = getResources(video);

  return {
    ...(await readMetadata({ video })),
    file: video,
    video: `/api/v1/video/${video}`,
    thumbnail: `/api/v1/thumbnail/${thumbnail}`,
    cameraName,
  };
};

const ensureThumbnail = async ({ video }) => {
  const { thumbPath, videoPath } = getResources(video);

  if (await exists(thumbPath)) {
    return;
  }

  const { duration } = await getMeta({ video });

  // TODO maybe write an error image in this case?
  // we will detect this as a missing image and try to regenerate it every time
  if (duration === 0) {
    return;
  }

  await videoTools.image({
    input: videoPath,
    output: thumbPath,
    time: `${Math.floor(duration * 0.15)}`,
    width: 480,
    silent: !debug
  });
};

// optimize list for newest first, i.e. reverse alphabetical order
const list = async () => (await globby('**/*.mp4', { cwd })).reverse();

const sync = async ({ date, fullSync = false } = {}) => {
  // make sure sync is running only once, and results are re-used if
  // it is called a second time concurrently
  const key = `sync-promise-${date}-${fullSync}`;

  // if an operation with the same inputs is running, use its result
  if (syncCache.has(key)) {
    return await syncCache.get(key);
  }

  // if any other operations are running, wait for them to end before proceeding
  while (syncCache.size > 0) {
    await Promise.all(Array.from(syncCache.values()));
  }

  syncCache.set(key, Promise.resolve().then(async () => {
    const result = [];

    const [videos, cacheList] = await Promise.all([
      list(),
      (async () => new Set(await fs.readdir(cache)))()
    ]);

    for (const video of videos) {
      try {
        const meta = await getMeta({ video });

        if (!date || fullSync === true || date === formatDate(new Date(meta.date))) {
          result.push(meta);

          const { thumbnail } = getResources(video);

          if (!cacheList.has(thumbnail)) {
            await ensureThumbnail({ video });
          }
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

const purge = async () => {
  if (!purgePeriod) {
    return;
  }

  const purgeDate = new Date();
  purgeDate.setDate(purgeDate.getDate() - purgePeriod - 1);

  const videos = await list();

  for (const video of videos) {
    try {
      const meta = await getMeta({ video });

      if (meta.date < purgeDate.toISOString()) {
        const { videoPath, thumbPath, metaPath } = getResources(video);

        await fs.rm(videoPath, { force: true });

        await Promise.allSettled([
          fs.rm(thumbPath, { force: true }),
          fs.rm(metaPath, { force: true }),
        ]);
      }
    } catch (e) {
      console.error(`failed to purge "${video}":`, e);
    }
  }

  module.exports.clearCache();
  await sync();
};

module.exports = {
  sync,
  purge,
  clearCache: () => {
    metaCache.clear();
  }
};
