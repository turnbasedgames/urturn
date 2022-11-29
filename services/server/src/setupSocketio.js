const mongoose = require('mongoose');
const UserSocket = require('./models/user/userSocket');
const Room = require('./models/room/room');
const Game = require('./models/game/game');
const { socketioLoggerMiddleware } = require('./middleware/httpLogger');
const { socketioAuthMiddelware } = require('./middleware/auth');
const logger = require('./logger');
const { quitRoomTransaction, populateRoomAndNotify } = require('./models/room/util');

const DEFAULT_DISCONNECT_TIMEOUT_SECS = 30;

async function createUserSocket(socket, room, serviceInstance) {
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
      serviceInstance: serviceInstance.id,
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

async function deleteUserSocket(io, socket) {
  const room = await Room.findById(socket.data.roomId);
  if (room == null) {
    throw new Error('Room does not exist');
  }

  let lastSocket = false;
  let existingUserGameSocketPair;
  await mongoose.connection.transaction(async (session) => {
    // we have to make a ghost edit to avoid possible stale reads
    // https://www.mongodb.com/docs/manual/core/transactions-production-consideration/#in-progress-transactions-and-stale-reads
    existingUserGameSocketPair = await UserSocket.findOneAndUpdate({
      game: room.game,
      user: socket.data.user.id,
      socketId: { $ne: socket.id },
    }, { game: room.game }).session(session).exec();

    const operationPromises = [UserSocket.deleteOne({
      socketId: socket.id,
    }).session(session).exec()];

    // only decrement activePlayerCount if this is the last socket with (user, game) pair
    if (existingUserGameSocketPair == null) {
      lastSocket = true;
      operationPromises.push(Game.findOneAndUpdate(
        // this operation will not error if game no longer exists (gets deleted)
        { _id: room.game },
        { $inc: { activePlayerCount: -1 } },
      ).session(session).exec());
    }
    await Promise.all(operationPromises);
  });
  socket.logger.info('finished deleteSocket transaction',
    {
      socketId: socket.id,
      userId: socket.data.user.id,
      existingUserGameSocketPairSocketId: existingUserGameSocketPair?.socketId,
    });
  // room.private should never change, so checking before the quit transaction will not have
  // race conditions
  // room.finished can change, but a pre check here is an optimization to prevent unnecessary
  // setTimeout call. The quitRoomTransaction fn call should already account for room.finished.
  if (lastSocket && !room.private && !room.finished) {
    // Call onPlayerQuit if a player is unable to maintain a good connection after the disconnect
    // timeout, in order to provide a good experience for other players in public rooms. This avoids
    // players joining stale rooms and active players playing with bad actors.

    // Caveats:
    // I. Continuous Check Problem
    // we are not checking if the socket existed at a point in time between when setTimeout
    // is triggered and when it fires. This means there is an edge case where:
    // 1. user closes last socket (begins 30 second setTimeout)
    // 2. user connects a socket 10 seconds later and very quickly disconnects the socket
    // 3. at 30 seconds setTimeout triggers callback, but does not know there was a socket
    // created during this period, so it we call onPlayerQuit for the player anyways.
    // This edge case can be solved in multiple ways: soft delete sockets by marking them, and set
    // a TTL the same as DEFAULT_DISCONNECT_TIMEOUT_SECS for the document (mongodb supports TTL).
    // Whether or not this is something we want to do product wise is up for debate. A flickering
    // socket connection may imply that the user has an unstable internet connection and its okay
    // to kick them anyways. We still maintain the premise that a user needs a good connection in
    // order to not kick them, in order to prevent from giving a bad experience to other players.
    // II. Fault Tolerance Problem
    // The instance may be killed for any reason (release, outage, etc). We can try await this
    // handler for graceful shutdown, but that does not actually offer fault tolerance. We can
    // handle this by handling timeout checks in a separate system.
    setTimeout(async () => {
      existingUserGameSocketPair = await UserSocket.findOne({
        game: room.game,
        user: socket.data.user.id,
      }).exec();

      if (existingUserGameSocketPair == null) {
        try {
          socket.logger.info('started kicking user from room');
          const { room: roomRes, roomState } = await quitRoomTransaction(
            logger, socket.data.user, room.id,
          );
          await populateRoomAndNotify(io, roomRes, roomState);
          socket.logger.info('finished kicking user from room');
        } catch (error) {
          socket.logger.error('error while trying to kick player', error);
        }
      } else {
        socket.logger.info('disconnect timeout thwarted', { existingUserGameSocketPair });
      }
    }, DEFAULT_DISCONNECT_TIMEOUT_SECS * 1000);
  }
}

async function handleSocketDisconnect(io, socket, reason) {
  try {
    socket.logger.info('handling socket disconnect', {
      id: socket.id,
      userId: socket.data.user.id,
      roomId: socket.data.roomId,
      reason,
    });
    if (socket.data.roomId != null) {
      await deleteUserSocket(io, socket);
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

function setupSocketio(io, serviceInstance) {
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
        await createUserSocket(socket, room, serviceInstance);
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
