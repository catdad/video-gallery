const fs = require('fs/promises');

const initDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

module.exports = { initDir };
