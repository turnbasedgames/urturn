const redis = require('redis');
const redisAdapter = require('@socket.io/redis-adapter');

const logger = require('./logger');

const pubClient = redis.createClient({
  url: process.env.REDIS_CONNECTION_URL,
});
const subClient = pubClient.duplicate();

function setupSocketio(io) {
  io.adapter(redisAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    logger.info('new socket connection', { id: socket.id });

    socket.on('watchRoom', ({ roomId }) => {
      logger.info('watching room', { id: socket.id, roomId });
      socket.join(roomId);
    });

    socket.on('unwatchRoom', ({ roomId }) => {
      logger.info('unwatching room', { id: socket.id, roomId });
      socket.leave(roomId);
    });
  });
}

module.exports = setupSocketio;
