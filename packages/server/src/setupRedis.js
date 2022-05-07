const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

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

const setupRedis = async ({ io }) => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
};

module.exports = { setupRedis, pubClient, subClient };
