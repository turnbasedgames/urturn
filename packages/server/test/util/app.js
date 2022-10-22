require('dotenv').config();
const { spawn } = require('child_process');
const axios = require('axios');
const getPort = require('get-port');

const { waitFor, setupMongoDB, setupRedis } = require('./util');
const { testStripeKey, testStripeWebhookSecret } = require('./stripe');

function waitUntilRunning(t, api, timeout = 30000, buffer = 200) {
  return waitFor(
    t,
    async () => { await api.get('/readiness'); },
    timeout, buffer, 'Server was not ready',
  );
}

async function spawnServer(t, env, api) {
  const server = spawn('node', ['index.js'], { env });
  server.stdout.setEncoding('utf8');
  server.stdout.on('data', (data) => {
    t.log(`server process (stdout): ${data.trim()}`);
  });
  server.stderr.setEncoding('utf8');
  server.stderr.on('data', (data) => {
    t.log(`server process (stderr): ${data.trim()}`);
  });

  try {
    await waitUntilRunning(t, api);
  } catch (err) {
    server.kill();
    throw err;
  }
  return server;
}

async function spawnApp(t, options = {}) {
  const {
    overrideEnv,
    defaultMongoEnv,
    defaultRedisEnv,
    forceCreatePersistentDependencies,
    nameDictionary,
    nameIterations,
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
  const [envWithMongo, cleanupMongoDB] = await setupMongoDB(
    t.log, defaultMongoEnv, forceCreatePersistentDependencies,
  );
  const [envWithRedis, cleanupRedis] = await setupRedis(
    t.log, defaultRedisEnv, forceCreatePersistentDependencies,
  );

  const baseURL = `http://localhost:${env.PORT}`;
  const api = axios.create({ baseURL });
  const server = await spawnServer(
    t,
    {
      ...env, ...envWithMongo, ...envWithRedis, ...overrideEnv,
    }, api,
  );
  return {
    api,
    server,
    baseURL,
    envWithMongo,
    envWithRedis,
    cleanupRedis,
    cleanupMongoDB,
    cleanup: async () => {
      // wait a second because server may be in a cleanup process
      const exitPromise = new Promise((resolve, reject) => {
        server.on('exit', () => {
          t.log('server properly exited');
          resolve();
        });
        setTimeout(() => {
          t.log('server timed out waiting to cleanup');
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
