const redis = require('redis');

const logger = require('./logger');

const pubClient = redis.createClient({
  url: process.env.REDIS_URL,
});
const subClient = pubClient.duplicate();
subClient.on('ready', () => {
  logger.info('redis subscriber is ready');
});
subClient.on('error', (error) => {
  logger.error('redis subscriber client error', { error });
});

pubClient.on('ready', () => {
  logger.info('redis publisher is ready');
});
pubClient.on('error', (error) => {
  logger.error('redis publish client error', { error });
});

const setupRedis = async () => {
  await pubClient.connect();
  await subClient.connect();
};

module.exports = { setupRedis, pubClient, subClient };
