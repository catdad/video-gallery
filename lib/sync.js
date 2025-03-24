const path = require('path');
const fs = require('fs/promises');

const { get } = require('lodash');
const { globby } = require('globby');
const { map: videoTools } = require('video-tools');
const { debug } = require('./opts.js');

const exists = async (file) => {
  try {
    await fs.stat(file);
    return true;
  } catch (e) {
    return false;
  }
};

const getMeta = async ({ filepath, input, metadata }) => {
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
};

// TODO this should only be able to be called once in parallel
// i.e. wait for previous to finish before starting a new once
const sync = async ({ input: cwd, cache }) => {
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

  return result;
};

module.exports = { sync };
