const { spawn } = require('child_process');

const logger = require('../src/logger');
const { setupMongoDB, setupRedis } = require('../test/util/util');

async function main() {
  const env = {
    PATH: process.env.PATH,
  };

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  }
  if (process.env.STRIPE_KEY) {
    env.STRIPE_KEY = process.env.STRIPE_KEY;
  }
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  }

  const [envWithMongo] = await setupMongoDB(logger.info);
  const [envWithRedis] = await setupRedis(logger.info);

  const serverEnv = { ...env, ...envWithMongo, ...envWithRedis };
  logger.info('Running server with dev environment', serverEnv);
  const server = spawn('nodemon', ['dist/index.js'], { env: serverEnv });
  const exitPromise = new Promise((resolve) => {
    server.on('exit', (code) => {
      logger.warn(`server exited with code: ${code}`);
      resolve();
    });
  });
  server.stdout.setEncoding('utf8');
  server.stdout.on('data', (data) => {
    process.stdout.write(`server: ${data}`);
  });
  server.stderr.setEncoding('utf8');
  server.stderr.on('data', (data) => {
    process.stderr.write(`server: ${data}`);
  });

  process.on('SIGINT', async () => {
    await exitPromise;
    process.exit(0);
  });
}

main();
