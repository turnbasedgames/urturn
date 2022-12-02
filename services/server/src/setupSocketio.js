const Room = require('./models/room/room');
const { socketioLoggerMiddleware } = require('./middleware/httpLogger');
const { socketioUserAuthMiddelware } = require('./middleware/auth');
const logger = require('./logger');
const {
  deleteUserSocket,
  createUserSocket,
} = require('./models/user/util');

async function handleSocketDisconnect(io, socket, reason) {
  try {
    socket.logger.info('handling socket disconnect', {
      id: socket.id,
      userId: socket.data.user.id,
      roomId: socket.data.roomId,
      reason,
    });
    if (socket.data.roomId != null) {
      await deleteUserSocket(io, socket.logger, socket.data.roomId, socket.data.user, socket.id);
    } else {
      socket.logger.info('socket was not watching a room when disconnecting');
    }
    socket.logger.info('finished handling socket disconnect');
  } catch (error) {
    socket.logger.error('handling socket disconnect failed', {
      id: socket.id,
      error: { name: error.name, message: error.message, stack: error.stack },
    });
  }
}

function setupSocketio(io, serviceInstanceId) {
  io.use(socketioLoggerMiddleware);
  io.use(socketioUserAuthMiddelware);

  // We maintain that sockets can only be associated with one room in its lifetime.
  // If a client wants to watch another room, it needs to create a new socket connection.
  io.on('connection', (socket) => {
    socket.logger.info('new socket connection', { id: socket.id });

    const defaultCb = (...args) => socket.logger.info('callback did not exist, so was not called with args:', args);
    socket.on('watchRoom', async ({ roomId }, cb = defaultCb) => {
      try {
        socket.logger.info('attempting to watch room', { id: socket.id, roomId, userId: socket.data.user.id });
        if (socket.data.roomId != null) {
          throw new Error(`Socket already connected to a room: ${roomId}`);
        }
        const room = await Room.findById(roomId);
        if (room == null) {
          throw new Error('Room does not exist');
        }
        await createUserSocket(socket, room, serviceInstanceId);
        await socket.join(roomId);
        cb();
        socket.logger.info('watching room', { id: socket.id, roomId });
      } catch (error) {
        socket.logger.error('error when watching room', {
          id: socket.id,
          error: { name: error.name, message: error.message, stack: error.stack },
        });
        cb({ error: error.toString() });
      }
    });

    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-param-reassign
      socket.data.disconnectHandledPromise = handleSocketDisconnect(io, socket, reason);
    });
  });

  return () => new Promise((res, rej) => {
    try {
      logger.warn('cleaning up socketio server...');
      io.local.fetchSockets().then((sockets) => {
        // fetch sockets before closing socketio server so we can guarantee sockets disconnect
        // handlers are finished
        io.close(async () => {
          logger.warn('successfully closed socketio server, it should not be handling new connections');
          logger.warn('disconnecting existing sockets...');
          logger.info(`cleaning up ${sockets.length} sockets`);
          io.local.disconnectSockets(true);
          await Promise.all(sockets.map((
            { data: { disconnectHandledPromise } },
          ) => disconnectHandledPromise));
          logger.warn('successfully closed existing sockets');
          logger.warn('successfully cleaned up socketio server');
          res();
        });
      }).catch(rej);
    } catch (err) {
      rej(err);
    }
  });
}

module.exports = setupSocketio;
