const yargs = require('yargs');

const opts = yargs
  .option('port', {
    type: 'number',
    default: 3003,
    describe: 'the port where the server should run'
  })
  .option('directory', {
    type: 'string',
    demandOption: true,
    describe: 'the path where videos are stored'
  })
  .option('cache', {
    type: 'string',
    demantOption: true,
    describe: 'the path that should be used for cache'
  })
  .version()
  .help()
  .argv;

module.exports = opts;
