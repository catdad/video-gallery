const path = require('path');
const fs = require('fs/promises');

const { get } = require('lodash');
const { globby } = require('globby');
const { map: videoTools } = require('video-tools');

const exists = async (file) => {
  try {
    await fs.stat(file);
    return true;
  } catch (e) {
    return false;
  }
};

const list = async (cwd) => {
  return await globby('**/*.mp4', { cwd });
};

const sync = async ({ input, cache }) => {
  const result = [];
  const videos = (await list(input)).slice(0, 2);

  for (const video of videos) {
    const cacheDir = path.dirname(path.resolve(cache, video));
    const file = path.resolve(input, video);
    const metadata = path.resolve(cache, `${video}.json`);
    const thumbnail = path.resolve(cache, `${video}.jpg`);

    await fs.mkdir(cacheDir, { recursive: true });

    if (await exists(metadata)) {
      try {
        const meta = JSON.parse(await fs.readFile(metadata, 'utf-8'));
        result.push(meta.public);
      } catch (e) {
        console.error(`failed to get metadata for "${file}":`, e);
      }
    } else {
      try {
        const meta = await videoTools.meta({ input: file });
        const public = {
          video: `/api/v1/video/${video}`,
          thumbnail: `/api/v1/thumbnail/${video}.jpg`,
          duration: +get(meta, 'format.duration', 0)
        };

        await fs.writeFile(metadata, JSON.stringify({
          ...meta,
          public
        }, null, 2));

        result.push(public);
      } catch (e) {
        console.error(`failed to create metadata for "${file}":`, e);
      }
    }

    if (!(await exists(thumbnail))) {
      // TODO add support for resizing thumbnails
      // TODO make thumbnail creation silent
      // TODO generate thumbnail from the middle of the video rather than at the beginning
      await videoTools.image({ input: file, output: thumbnail, time: '0' })
    }
  }

  return result;
};

module.exports = { list, sync };
