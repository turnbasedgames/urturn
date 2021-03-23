require('dotenv').config();
const { spawn } = require('child_process');
const axios = require('axios');
const getPort = require('get-port');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

async function spawnDB() {
  const mongod = new MongoMemoryReplSet();
  await mongod.waitUntilRunning();
  const mongoUri = await mongod.getUri();
  return { mongod, mongoUri };
}

async function killDB(mongod) {
  await mongod.stop();
}

function waitUntilRunning(api, timeout = 10000, buffer = 200) {
  const timeoutThreshold = Date.now() + timeout;
  return new Promise((res, rej) => {
    const interval = setInterval(async () => {
      try {
        await api.get('/readiness');
        clearInterval(interval);
        res();
      } catch (err) {
        if (Date.now() > timeoutThreshold) {
          clearInterval(interval);
          rej(new Error(`Server was not reachable after ${timeout}ms`));
        }
      }
    }, buffer);
  });
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

function killServer(server) {
  server.kill();
}

async function spawnApp() {
  const { mongod, mongoUri } = await spawnDB();
  const env = {
    MONGODB_CONNECTION_URL: `${mongoUri}&retryWrites=false`,
    PATH: process.env.PATH,
    PORT: await getPort(),
  };
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  }
  const api = axios.create({ baseURL: `http://localhost:${env.PORT}` });
  const server = await spawnServer(env, api);
  return { api, mongod, server };
}

async function killApp(app) {
  killServer(app.server);
  await killDB(app.mongod);
}

module.exports = { spawnApp, killApp };
