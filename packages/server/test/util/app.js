require('dotenv').config();
const { spawn } = require('child_process');
const axios = require('axios');
const getPort = require('get-port');
const { v4: uuidv4 } = require('uuid');

const { waitFor, setupMongoDB, setupRedis } = require('./util');
const { testStripeKey, testStripeWebhookSecret } = require('./stripe');

function waitUntilRunning(t, api, timeout = 30000, buffer = 1000) {
  return waitFor(
    t,
    async () => { await api.get('/readiness'); },
    timeout, buffer, 'Server was not ready',
  );
}

function makeOnProcessDataFn(t, serviceId, type, taps, messages) {
  return (data) => {
    const trimmedLog = data.trim();
    const logEv = { serviceId, type, log: trimmedLog };
    taps.forEach((tap) => tap(logEv));

    if (t.context.logTapFn != null) {
      t.context.logTapFn(logEv);
    } else {
      t.log(`server process (${type}): ${trimmedLog}`);
    }
    messages.push(trimmedLog);
  };
}

async function spawnServer(t, env, api, noWait) {
  const serviceId = `service-${uuidv4()}`;
  const server = spawn('node', ['index.js'], { env });
  const taps = new Set();
  const stdoutMessages = [];
  server.stdout.setEncoding('utf8');
  server.stdout.on('data', makeOnProcessDataFn(t, serviceId, 'stdout', taps, stdoutMessages));
  const stderrMessages = [];
  server.stderr.setEncoding('utf8');
  server.stderr.on('data', makeOnProcessDataFn(t, serviceId, 'stderr', taps, stderrMessages));

  try {
    if (!noWait) {
      await waitUntilRunning(t, api);
    }
  } catch (err) {
    server.kill();
    throw err;
  }
  return {
    server,
    stdoutMessages,
    stderrMessages,
    addTap: (tapFn) => taps.add(tapFn),
    removeTap: (tapFn) => taps.delete(tapFn),
  };
}

async function spawnApp(t, options = {}) {
  const {
    overrideEnv,
    defaultMongoEnv,
    defaultRedisEnv,
    forceCreatePersistentDependencies,
    nameDictionary,
    nameIterations,
    noWait = false,
  } = options;
  const env = {
    PATH: process.env.PATH,
    PORT: await getPort(),
    // testing behavior during db failures will surface faster with a lower timeout
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: 1000,
    STRIPE_KEY: testStripeKey,
    STRIPE_WEBHOOK_SECRET: testStripeWebhookSecret,
  };
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  }
  if (nameDictionary !== undefined) {
    env.NAMES_GENERATOR_DICTIONARY = nameDictionary;
  }
  if (nameIterations !== undefined) {
    env.NAMES_GENERATOR_MAX_ITERATIONS = nameIterations;
  }
  const logFn = t.context.logTapFn ?? t.log;
  const [envWithMongo, cleanupMongoDB, mongoClientDatabase] = await setupMongoDB(
    logFn, defaultMongoEnv, forceCreatePersistentDependencies,
  );
  const [envWithRedis, cleanupRedis] = await setupRedis(
    logFn, defaultRedisEnv, forceCreatePersistentDependencies,
  );

  const baseURL = `http://localhost:${env.PORT}`;
  const api = axios.create({ baseURL });
  const {
    server, stderrMessages, stdoutMessages, addTap, removeTap,
  } = await spawnServer(
    t,
    {
      ...env, ...envWithMongo, ...envWithRedis, ...overrideEnv,
    }, api,
    noWait,
  );
  return {
    api,
    addTap,
    removeTap,
    server,
    stderrMessages,
    stdoutMessages,
    baseURL,
    envWithMongo,
    envWithRedis,
    cleanupRedis,
    cleanupMongoDB,
    mongoClientDatabase,
    cleanup: async () => {
      // wait a second because server may be in a cleanup process
      const exitPromise = new Promise((resolve, reject) => {
        server.on('exit', () => {
          logFn({ log: 'server properly exited' });
          resolve();
        });
        setTimeout(() => {
          logFn({ log: 'server timed out waiting to cleanup' });
          reject(new Error('timeout reached'));
        }, 10000);
      });
      server.kill();
      await exitPromise; // wait for server to exit before nuking redis and mongoDB
      await Promise.all([cleanupMongoDB(), cleanupRedis()]);
    },
  };
}

module.exports = { spawnApp };
