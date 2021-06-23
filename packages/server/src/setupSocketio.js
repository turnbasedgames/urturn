const redisAdapter = require('@socket.io/redis-adapter');

const { pubClient, subClient } = require('./setupRedis');
const logger = require('./logger');

function setupSocketio(io) {
  io.adapter(redisAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    logger.info('new socket connection', { id: socket.id });

    socket.on('watchRoom', async ({ roomId }, cb) => {
      logger.info('watching room', { id: socket.id, roomId });
      try {
        await socket.join(roomId);
        cb();
      } catch (error) {
        logger.error('error when watching room', { error: error.toString() });
        cb({ error: error.toString() });
      }
    });

    socket.on('unwatchRoom', async ({ roomId }, cb) => {
      logger.info('unwatching room', { id: socket.id, roomId });
      try {
        await socket.leave(roomId);
        cb(null);
      } catch (error) {
        logger.error('error when unwatching room', { error: error.toString() });
        cb({ error: error.toString() });
      }
    });
  });
}

module.exports = setupSocketio;
