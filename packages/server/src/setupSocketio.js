const mongoose = require('mongoose');
const UserSocket = require('./models/user/userSocket');
const Room = require('./models/room/room');
const Game = require('./models/game/game');
const { socketioLoggerMiddleware } = require('./middleware/httpLogger');
const { socketioAuthMiddelware } = require('./middleware/auth');
const logger = require('./logger');

async function createUserSocket(socket, room) {
  // Don't need to query for room in transaction because the gameId does not change and thus,
  // guaranteed to be up to date
  await mongoose.connection.transaction(async (session) => {
    // we have to make a ghost edit to avoid possible stale reads
    // https://www.mongodb.com/docs/manual/core/transactions-production-consideration/#in-progress-transactions-and-stale-reads
    const existingUserGameSocketPair = await UserSocket.findOneAndUpdate({
      game: room.game,
      user: socket.data.user.id,
    },
    { game: room.game }).session(session).exec();

    const userSocket = new UserSocket({
      socketId: socket.id,
      room: room.id,
      game: room.game,
      user: socket.data.user.id,
    });
    const operationPromises = [userSocket.save({ session })];

    // only increment activePlayerCount if this is the first socket with (user, game) pair
    if (existingUserGameSocketPair == null) {
      operationPromises.push(Game.findOneAndUpdate(
        { _id: room.game },
        { $inc: { activePlayerCount: 1 } },
      ).session(session).exec());
    }

    await Promise.all(operationPromises);

    // eslint-disable-next-line no-param-reassign
    socket.data.roomId = room.id;
  });
}

async function deleteUserSocket(socket) {
  const room = await Room.findById(socket.data.roomId);
  if (room == null) {
    throw new Error('Room does not exist');
  }

  await mongoose.connection.transaction(async (session) => {
    // we have to make a ghost edit to avoid possible stale reads
    // https://www.mongodb.com/docs/manual/core/transactions-production-consideration/#in-progress-transactions-and-stale-reads
    const existingUserGameSocketPair = await UserSocket.findOneAndUpdate({
      game: room.game,
      user: socket.data.user.id,
      socketId: { $ne: socket.id },
    }, { game: room.game }).session(session).exec();

    const operationPromises = [UserSocket.deleteOne({
      socketId: socket.id,
    }).session(session).exec()];

    // only decrement activePlayerCount if this is the last socket with (user, game) pair
    if (existingUserGameSocketPair == null) {
      operationPromises.push(Game.findOneAndUpdate(
        { _id: room.game },
        { $inc: { activePlayerCount: -1 } },
      ).session(session).exec());
    }
    await Promise.all(operationPromises);
    socket.logger.info('wrapping up delete userSocket transaction',
      {
        socketId: socket.id,
        userId: socket.data.user.id,
        existingUserGameSocketPairSocketId: existingUserGameSocketPair?.socketId,
      });
  });
}

async function handleSocketDisconnect(socket, reason) {
  try {
    socket.logger.info('handling socket disconnect', {
      id: socket.id,
      userId: socket.data.user.id,
      roomId: socket.data.roomId,
      reason,
    });
    if (socket.data.roomId != null) {
      await deleteUserSocket(socket);
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

function setupSocketio(io) {
  io.use(socketioLoggerMiddleware);
  io.use(socketioAuthMiddelware);

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
        await createUserSocket(socket, room);
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
      socket.data.disconnectHandledPromise = handleSocketDisconnect(socket, reason);
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
