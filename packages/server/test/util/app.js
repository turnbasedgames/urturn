require('dotenv').config();
const { spawn } = require('child_process');
const axios = require('axios');
const getPort = require('get-port');

const { waitFor, setupMongoDB, setupRedis } = require('./util');

function waitUntilRunning(api, timeout = 10000, buffer = 200) {
  return waitFor(async () => { await api.get('/readiness'); },
    timeout, buffer, 'Server was not ready');
}

async function spawnServer(env, api) {
  const server = spawn('node', ['index.js'], { env });
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);
  try {
    await waitUntilRunning(api);
  } catch (err) {
    server.kill();
    throw err;
  }
  return server;
}

async function spawnApp(defaultMongoEnv, defaultRedisEnv) {
  const env = {
    PATH: process.env.PATH,
    PORT: await getPort(),
  };
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  }

  const [envWithMongo, cleanupMongoDB] = await setupMongoDB(defaultMongoEnv);
  const [envWithRedis, cleanupRedis] = await setupRedis(defaultRedisEnv);

  const baseURL = `http://localhost:${env.PORT}`;
  const api = axios.create({ baseURL });
  const server = await spawnServer({ ...env, ...envWithMongo, ...envWithRedis }, api);
  return {
    api,
    server,
    baseURL,
    envWithMongo,
    envWithRedis,
    cleanup: async () => {
      server.kill();
      await cleanupMongoDB();
      await cleanupRedis();
    },
  };
}

module.exports = { spawnApp };
