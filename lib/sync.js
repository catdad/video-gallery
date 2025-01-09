const path = require('path');
const fs = require('fs/promises');

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
  const videos = (await list(input));

  for (const video of videos) {
    const cacheDir = path.dirname(path.resolve(cache, video));
    const file = path.resolve(input, video);
    const metadata = path.resolve(cache, `${video}.json`);
    const thumbnail = path.resolve(cache, `${video}.jpg`);

    await fs.mkdir(cacheDir, { recursive: true });

    if (!(await exists(metadata))) {
      try {
        const data = await videoTools.meta({ input: file });
        await fs.writeFile(metadata, JSON.stringify(data, null, 2));
      } catch (e) {
        console.error(`failed to create metadata for "${file}":`, e);
      }
    }

    if (!(await exists(thumbnail))) {
      // TODO add support for resizing thumbnails
      // TODO make thumbnail creation silent
      await videoTools.image({ input: file, output: thumbnail, time: '0' })
    }
  }
};

module.exports = { list, sync };
