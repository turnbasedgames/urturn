const LRU = require('lru-cache');
const { NodeVM } = require('vm2');
const axios = require('axios');

const UserCode = require('./userCode');

const runnerCacheOptions = {
  // Only support 200 unique game github urls at a time
  // If a game just got updated to a new commit sha it will have a different github url
  max: 200,
  dispose: (value, key) => {
    value.logger.info('cache is expiring user code module', { key });
  },
  // The code for a github url should never change (commit SHA is unique). This means we are not
  // setting the ttl because the data can be stale. This protects us from various runner failures
  // that we may not know of: for example, the user code may have a memory leak and begins to take
  // more resources than it should.
  // ttl is 1 hour: units here are in ms
  ttl: 60 * 60 * 1000,
  // We reset the ttl on get because this implies that users are playing the game using this code.
  updateAgeOnGet: true,
  updateAgeOnHas: false,

  // method for actually creating the userCode object to be used for various room operations
  fetchMethod: async (key, _, options) => {
    const { logger, game, url } = options.context;
    logger.info('cache miss, so requesting github url for code string...', { key });
    const { data: vmModuleStr, headers } = await axios.get(url);
    // There isn't a simple way to calculate memory footprint of a generic object (the vmModule).
    // Ideally size is the amount of bytes the user code uses in memory and changes dynamically.
    // To get a minimum bound we use the number of bytes the code string itself is.
    const sizeBytes = headers['content-length'];
    logger.info('loading vm', { sizeBytes });
    const vm = new NodeVM({});
    // TODO: actually put the creator logs somewhere useful so that developers can debug
    // TODO: These logs may be using the wrong logger object because this runner object may be used.
    // for another request than the original request that created this object. Instead we should be
    // passing in a custom logger that is locked down every time we make a user code function call
    // (e.g. onRoomStart(logger))
    vm.on('console.log', (data) => {
      logger.info('creator log', { data, gameId: game.id });
    });
    const vmModule = vm.run(vmModuleStr);
    const userCode = new UserCode(logger, vmModule, sizeBytes);
    logger.info('vm loaded and ready to use');
    return userCode;
  },
  // if we are unable to refetch for a github url, then continue to use the same key
  noDeleteOnFetchRejection: true,
};
const runnerCache = new LRU(runnerCacheOptions);

module.exports = async function fetchUserCodeFromGame(logger, game) {
  const githubURL = new URL(game.githubURL);
  const [owner, repo] = githubURL.pathname.match(/[^/]+/g);
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${game.commitSHA}/index.js`;
  logger.info('attempting to fetch userCode object from cache', { url, gameId: game.id });
  const userCode = await runnerCache.fetch(url, { fetchContext: { url, logger, game } });
  logger.info('userCode object is ready');
  return userCode;
};
