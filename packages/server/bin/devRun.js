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

  const [envWithMongo, cleanupMongoDB] = await setupMongoDB(logger.info);
  const [envWithRedis, cleanupRedis] = await setupRedis(logger.info);

  const serverEnv = { ...env, ...envWithMongo, ...envWithRedis };
  logger.info('Running server with dev environment', serverEnv);
  const server = spawn('nodemon', ['index.js'], { env: serverEnv });
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);

  process.on('SIGINT', async () => {
    logger.info('\ncleaning up local runtime dependencies');
    logger.info('killing server...');
    server.kill();
    await cleanupMongoDB();
    await cleanupRedis();
    process.exit();
  });
}

main();
