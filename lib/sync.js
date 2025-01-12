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

const sync = async ({ input: cwd, cache }) => {
  const result = [];
  // optimize list for newest first, i.e. reverse alphabetical order
  const videos = (await globby('**/*.mp4', { cwd })).reverse();

  for (const video of videos) {
    const cacheDir = path.dirname(path.resolve(cache, video));
    const file = path.resolve(cwd, video);
    const metadata = path.resolve(cache, `${video}.json`);
    const thumbnail = path.resolve(cache, `${video}.jpg`);

    await fs.mkdir(cacheDir, { recursive: true });

    let duration = 0;

    if (await exists(metadata)) {
      try {
        const meta = JSON.parse(await fs.readFile(metadata, 'utf-8'));
        result.push(meta.public);

        if (meta.public.duration) {
          duration = meta.public.duration;
        }
      } catch (e) {
        console.error(`failed to get metadata for "${file}":`, e);
      }
    } else {
      try {
        const meta = await videoTools.meta({ input: file });
        const public = {
          video: `/api/v1/video/${video}`,
          thumbnail: `/api/v1/thumbnail/${video}.jpg`,
          duration: +get(meta, 'format.duration', 0),
          date: get(meta, 'format.tags.creation_time', null)
        };

        if (public.duration) {
          duration = public.duration;
        }

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
      await videoTools.image({
        input: file,
        output: thumbnail,
        time: `${Math.floor(duration * 0.25)}`,
        width: 480,
        silent: true
      })
    }
  }

  return result;
};

module.exports = { sync };
