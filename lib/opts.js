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
  .option('filter', {
    type: 'string',
    describe: 'map a folder in the input directory to a named filter (e.g. "path:name")',
    default: [],
    coerce: (value) => {
      if (typeof value === 'string') {
        value = value.split(',');
      } else if (!Array.isArray(value)) {
        throw new Error(`"${value}" cannot be handled as a filter`);
      }

      return value.reduce((memo, option) => {
        if (!/^[^:]+:[^:]+$/.test(option)) {
          throw new Error(`"${option}" is not a valid filter value`);
        }

        const [directory, name] = option.split(':');

        memo[directory] = name;

        return memo;
      }, {});
    }
  })
  .option('sync-period', {
    type: 'number',
    default: 15,
    describe: 'how often to sync the cache, in minutes'
  })
  .options('purge-period', {
    type: 'number',
    description: 'delete videos from input after this number of days'
  })
  .option('debug', {
    type: 'boolean',
    default: false
  })
  .version()
  .help()
  .argv;

module.exports = opts;
