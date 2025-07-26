const { Transform } = require('node:stream');
const { map: videoTools } = require('video-tools');

const resize = ({ file, width }) => {
  const stream = new Transform({
    transform: (chunk, enc, cb) => {
      cb(null, chunk);
    }
  });

  const promise = videoTools.x264({
    input: file,
    output: 'pipe:1',
    stdout: stream,
    width,
    video: 'h264',
    threads: 1,
    preset: 'ultrafast'
  });

  return { promise, stream };
};

module.exports = { resize };
