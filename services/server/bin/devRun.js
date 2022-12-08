const { spawn } = require('child_process');

const logger = require('../src/logger');
const { setupMongoDB, setupRedis, setupMongoDBClient } = require('../test/util/util');
const gamesSeedData = require('./seedData/games.json');
const usersSeedData = require('./seedData/users.json');

async function seedData({ MONGODB_CONNECTION_URL }) {
  // only seed data when no mongodb was provided
  if (process.env.MONGODB_CONNECTION_URL == null) {
    logger.info(`Seeding data to ${MONGODB_CONNECTION_URL}...`);
    // seed data was generated manually by copying various documents from production/staging to the
    const mongoClientDatabase = setupMongoDBClient(MONGODB_CONNECTION_URL);
    const { insertedIds: userIds } = await mongoClientDatabase.collection('users').insertMany(usersSeedData);

    // game seed data need to have a creator set
    const creatorId = userIds[0];
    await mongoClientDatabase.collection('games').insertMany(gamesSeedData
      .map((game) => ({
        ...game,
        creator: {
          $oid: creatorId,
        },
      })));
  } else {
    logger.info('Not seeding data because targeting an external MongoDB replicaset');
  }
}

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
  await seedData(envWithMongo);

  const serverEnv = { ...env, ...envWithMongo, ...envWithRedis };
  logger.info('Running server with dev environment', serverEnv);
  const server = spawn('nodemon', ['index.js'], { env: serverEnv });
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
