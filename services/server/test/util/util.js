const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { RedisMemoryServer } = require('redis-memory-server');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { cleanupTestUsers } = require('./api_util');
const { spawnApp } = require('./app');

function getNested(obj, ...args) {
  return args.reduce((nestedObj, level) => nestedObj && nestedObj[level], obj);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitFor(logFn, testAsyncFunc, timeoutMs = 10000, bufferMs = 200, errorMsg = 'Test Function did not pass') {
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
            logFn({
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
        logFn({
          message: 'unexpected error when waiting',
          error,
        });
        clearInterval(interval);
        rej(error);
      }
    }, bufferMs);
  });
}

function waitForOutput(logFn, message, listOfOutput, timeoutMs = 10000, bufferMs = 200, errorMsg = 'Test app never logged the expected output') {
  return waitFor(logFn,
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
        logFn({ log: `skipping starting local ${name} (using provided default)...` });
        return [defaultEnv,
          () => { logFn({ log: `skipping killing local ${name} instance.` }); }];
      }
      if (process.env[envField]) {
        logFn({ log: `skipping starting local ${name} (using uri specified in .env)...` });
        return [{ [envField]: process.env[envField] },
          () => { logFn({ log: `skipping killing local ${name} instance.` }); }];
      }
    }
    const [uri, cleanupFunc, client] = await setupFunc();
    logFn({ log: `started local ${name} instance at URI: ${uri}` });
    return [{ [envField]: uri }, async () => {
      logFn({ log: `killing local ${name} instance...` });
      await cleanupFunc();
    }, client];
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
    const mongoClient = new MongoClient(uri);
    return [uri, async () => {
      await mongoClient.close();
      await mongod.stop();
    },
    mongoClient.db('test')];
  });

const setupRedis = makePersistentDependencyFn('Redis', 'REDIS_URL',
  async () => {
    const redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();
    const uri = `redis://${host}:${port}`;
    return [uri, async () => { await redisServer.stop(); }];
  });

function setupTestFileLogContext(test) {
  // ava guarantees that title is unique across test object (test file)
  const testFileLogContext = new Map();

  test.beforeEach((t) => {
    const { app } = t.context;
    const cid = `test-${uuidv4()}`;

    const logs = [];
    testFileLogContext.set(t.title, logs);

    // add filtered tap to the helper app that is shared across tests
    if (app != null) {
      const { addTap, api } = app;
      api.defaults.headers.common['x-correlation-id'] = cid;
      addTap((evt) => {
        if (evt.log?.includes(cid)) {
          const { serviceId, type, log } = evt;
          logs.push([new Date().toISOString(), serviceId, type, log]);
        }
      });
    }

    /* eslint-disable no-param-reassign */
    t.context.log = (...args) => {
      logs.push([new Date().toISOString(), ...args]);
    };
    t.context.cid = cid;
    /* eslint-enable no-param-reassign */
  });

  // after a test file runs we should print out all the logs organized by test title
  // and in chronological order
  test.after.always((t) => {
    testFileLogContext.forEach((logs, testTitle) => {
      if (logs.length > 0) {
        t.log('');
        t.log(`Output for: ${testTitle}`);
        logs.forEach((log) => {
          t.log(...log);
        });
        t.log('');
      }
    });
  });
}

function setupTestBeforeAfterHooks(test) {
  test.before(async (t) => {
    const app = await spawnApp(t);
    /* eslint-disable no-param-reassign */
    t.context.app = app;
    t.context.createdUsers = [];
  /* eslint-enable no-param-reassign */
  });

  test.after.always(async (t) => {
    const { app, sideApps } = t.context;

    await cleanupTestUsers(t);
    await app.cleanup();
    if (sideApps) {
      await sideApps.cleanup();
    }
  });
}

module.exports = {
  createOrUpdateSideApps,
  getNested,
  waitFor,
  waitForOutput,
  setupMongoDB,
  setupRedis,
  sleep,
  setupTestFileLogContext,
  setupTestBeforeAfterHooks,
};
