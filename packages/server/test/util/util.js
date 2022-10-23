const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { RedisMemoryServer } = require('redis-memory-server');

function getNested(obj, ...args) {
  return args.reduce((nestedObj, level) => nestedObj && nestedObj[level], obj);
}

function waitFor(t, testAsyncFunc, timeoutMs = 10000, bufferMs = 200, errorMsg = 'Test Function did not pass') {
  const startTime = new Date();
  const timeoutThreshold = startTime.getTime() + timeoutMs;
  return new Promise((res, rej) => {
    const interval = setInterval(async () => {
      try {
        let result; let
          asyncFuncError;
        try {
          result = await testAsyncFunc();
        } catch (error) {
          asyncFuncError = error;
        }
        if (asyncFuncError == null) {
          clearInterval(interval);
          res(result);
        } else {
          const endTime = new Date();
          if (endTime.getTime() > timeoutThreshold) {
            t.log({
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              timeoutMs,
              error: asyncFuncError,
            });
            clearInterval(interval);
            const timeoutError = new Error(`${errorMsg} after ${timeoutMs}ms`);
            timeoutError.asyncFuncError = asyncFuncError;
            rej(timeoutError);
          }
        }
      } catch (error) {
        t.log({
          message: 'unexpected error when waiting',
          error,
        });
        clearInterval(interval);
        rej(error);
      }
    }, bufferMs);
  });
}

function waitForOutput(t, message, listOfOutput, timeoutMs = 10000, bufferMs = 200, errorMsg = 'Test app never logged the expected output') {
  return waitFor(t,
    async () => {
      if (listOfOutput.find(((line) => line.includes(message))) == null) {
        throw new Error(`Did not find message in output: ${message}`);
      } else {
        return true;
      }
    }, timeoutMs, bufferMs, errorMsg);
}

function makePersistentDependencyFn(name, envField, setupFunc) {
  return async (logFn, defaultEnv, forceCreate) => {
    if (!forceCreate) {
      if (defaultEnv) {
        logFn(`skipping starting local ${name} (using provided default)...`);
        return [defaultEnv,
          () => { logFn(`skipping killing local ${name} instance.`); }];
      }
      if (process.env[envField]) {
        logFn(`skipping starting local ${name} (using uri specified in .env)...`);
        return [{ [envField]: process.env[envField] },
          () => { logFn(`skipping killing local ${name} instance.`); }];
      }
    }
    const [uri, cleanupFunc] = await setupFunc();
    logFn(`started local ${name} instance at URI:`, { uri });
    return [{ [envField]: uri }, async () => {
      logFn(`killing local ${name} instance...`);
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
  createOrUpdateSideApps,
  getNested,
  waitFor,
  waitForOutput,
  setupMongoDB,
  setupRedis,
};
