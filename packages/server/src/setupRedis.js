const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const logger = require('./logger');

const pubClient = redis.createClient({
  url: process.env.REDIS_URL,
});
const subClient = pubClient.duplicate();

const setupClientEventLogging = (client, name) => {
  // log all events https://github.com/redis/node-redis#events
  client.on('connect', () => {
    logger.info(`redis client (${name}) is initiating a connection`);
  });
  client.on('ready', () => {
    logger.info(`redis client (${name}) is ready`);
  });
  client.on('end', () => {
    logger.warn(`redis client (${name}) disconnected the connection`);
  });
  client.on('error', (error) => {
    logger.error(`redis client (${name}) error`, error);
  });
  client.on('reconnecting', () => {
    logger.info(`redis client (${name}) is trying to reconnect`);
  });
};

setupClientEventLogging(subClient, 'subscriber');
setupClientEventLogging(pubClient, 'publisher');

const setupRedis = async ({ io }) => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  return async () => {
    logger.warn('closing redis publisher and subscriber client connection...');
    const clients = [pubClient, subClient];
    // calling quit here may not stop reconnecting tries, which is a bug in node-redis
    // https://github.com/redis/node-redis/issues/2010
    await Promise.all(clients.map((client) => client.quit()));
    logger.warn('successfully closed redis publisher and subscriber client connection');
  };
};

module.exports = { setupRedis, pubClient, subClient };
