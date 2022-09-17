const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { RedisMemoryServer } = require('redis-memory-server');

const logger = require('../../src/logger');

function getNested(obj, ...args) {
  return args.reduce((nestedObj, level) => nestedObj && nestedObj[level], obj);
}

function waitFor(testAsyncFunc, timeoutMs = 10000, bufferMs = 200, errorMsg = 'Test Function did not pass') {
  const timeoutThreshold = Date.now() + timeoutMs;
  return new Promise((res, rej) => {
    const interval = setInterval(async () => {
      try {
        const result = await testAsyncFunc();
        clearInterval(interval);
        res(result);
      } catch (err) {
        if (Date.now() > timeoutThreshold) {
          clearInterval(interval);
          rej(new Error(`${errorMsg} after ${timeoutMs}ms`));
        }
      }
    }, bufferMs);
  });
}

function makePersistentDependencyFn(name, envField, setupFunc) {
  return async (defaultEnv, forceCreate) => {
    if (!forceCreate) {
      if (defaultEnv) {
        logger.info(`skipping starting local ${name} (using provided default)...`);
        return [defaultEnv,
          () => { logger.info(`skipping killing local ${name} instance.`); }];
      }
      if (process.env[envField]) {
        logger.info(`skipping starting local ${name} (using uri specified in .env)...`);
        return [{ [envField]: process.env[envField] },
          () => { logger.info(`skipping killing local ${name} instance.`); }];
      }
    }
    const [uri, cleanupFunc] = await setupFunc();
    logger.info(`started local ${name} instance at URI:`, { uri });
    return [{ [envField]: uri }, async () => {
      logger.info(`killing local ${name} instance...`);
      await cleanupFunc();
    }];
  };
}

function createOrUpdateSideApps(t, newApps) {
  /* eslint-disable no-param-reassign */
  if (t.context.sideApps) {
    t.context.sideApps.apps = [...t.context.sideApps.apps, ...newApps];
  } else {
    t.context.sideApps = {
      apps: newApps,
      cleanup: async () => Promise.all(t.context.sideApps.map((a) => a.cleanup())),
    };
  }
  /* eslint-enable no-param-reassign */
}

const setupMongoDB = makePersistentDependencyFn('MongoDB', 'MONGODB_CONNECTION_URL',
  async () => {
    // use MongoMemoryReplSet instead of MongoMemoryServer because the app requires transactions
    const mongod = await MongoMemoryReplSet.create({ replSet: { count: 4 } });
    const uri = mongod.getUri();
    return [uri, async () => { await mongod.stop(); }];
  });

const setupRedis = makePersistentDependencyFn('Redis', 'REDIS_URL',
  async () => {
    const redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();
    const uri = `redis://${host}:${port}`;
    return [uri, async () => { await redisServer.stop(); }];
  });

module.exports = {
  waitFor, setupMongoDB, setupRedis, createOrUpdateSideApps, getNested,
};
