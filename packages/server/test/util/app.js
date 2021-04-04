require('dotenv').config();
const { spawn } = require('child_process');
const axios = require('axios');
const getPort = require('get-port');

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
  const env = {
    MONGODB_CONNECTION_URL: process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/test?replicaSet=testrs',
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
  return { api, server };
}

async function killApp(app) {
  killServer(app.server);
}

module.exports = { spawnApp, killApp };
