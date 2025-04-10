const yargs = require('yargs');

const opts = yargs
  .env()
  .option('port', {
    type: 'number',
    default: 3003,
    describe: 'the port where the server should run'
  })
  .option('host', {
    type: 'string',
    default: '0.0.0.0',
    describe: 'the host to listen on'
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
  .option('sync-period', {
    type: 'number',
    default: 15,
    describe: 'how often to sync the cache, in minutes'
  })
  .option('debug', {
    type: 'boolean',
    default: false
  })
  .version()
  .help()
  .argv;

module.exports = opts;
