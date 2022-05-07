const logger = require('./logger');

const defaultCb = (...args) => logger.info('callback did not exist, so was not called with args:', args);

function setupSocketio(io) {
  io.on('connection', (socket) => {
    logger.info('new socket connection', { id: socket.id });

    socket.on('watchRoom', async ({ roomId }, cb = defaultCb) => {
      logger.info('watching room', { id: socket.id, roomId });
      try {
        await socket.join(roomId);
        cb();
      } catch (error) {
        logger.error('error when watching room', { error: error.toString() });
        cb({ error: error.toString() });
      }
    });

    socket.on('unwatchRoom', async ({ roomId }, cb = defaultCb) => {
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
