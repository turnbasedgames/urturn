const {
  uniqueNamesGenerator,
  adjectives,
  animals,
} = require('unique-names-generator');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const User = require('./user');
const UserSocket = require('./userSocket');
const Game = require('../game/game');
const Room = require('../room/room');
const { UsernameGenerationError } = require('./errors');
const CurrencyToUrbuxTransaction = require('../transaction/currencyToUrbuxTransaction');
const { quitRoomTransaction, populateRoomAndNotify } = require('../room/util');

const NAMES_GENERATOR_CONFIG = {
  dictionaries: [adjectives, animals],
  separator: '_',
  length: 2,
};
if (process.env.NAMES_GENERATOR_DICTIONARY) {
  NAMES_GENERATOR_CONFIG.dictionaries = [process.env.NAMES_GENERATOR_DICTIONARY.split(',')];
  NAMES_GENERATOR_CONFIG.length = 1;
}

let NAMES_MAX_ITERATION = 10;
if (process.env.NAMES_GENERATOR_MAX_ITERATIONS) {
  NAMES_MAX_ITERATION = parseInt(process.env.NAMES_GENERATOR_MAX_ITERATIONS, 10);
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateRandomUniqueUsername = async (uid, count = 0, proposedUsernames = [], suffix = '') => {
  if (count > NAMES_MAX_ITERATION) {
    throw new UsernameGenerationError(uid, proposedUsernames);
  }

  const proposedUsername = uniqueNamesGenerator(NAMES_GENERATOR_CONFIG) + (count === 0 ? '' : `_${suffix}`);
  const existingUser = await User.findOne({ username: proposedUsername });
  if (existingUser) {
    return generateRandomUniqueUsername(
      uid,
      count + 1,
      [...proposedUsernames, proposedUsername],
      suffix + randomIntFromInterval(0, 9),
    );
  }
  return proposedUsername;
};

const handlePaymentTransaction = (
  logger, userId, urbuxAmount, paymentAmount, succeededPaymentIntent,
) => mongoose.connection.transaction(async (session) => {
  // we have to make a ghost edit to avoid possible stale reads
  // https://www.mongodb.com/docs/manual/core/transactions-production-consideration/#in-progress-transactions-and-stale-reads
  const currencyToUrbuxTransaction = await CurrencyToUrbuxTransaction.findOneAndUpdate({
    paymentIntentId: succeededPaymentIntent.id,
  }, {
    paymentIntentId: succeededPaymentIntent.id,
  }).session(session).exec();
  if (currencyToUrbuxTransaction) {
    logger.info('duplicate transaction found', { succeededPaymentIntent });
    // If the transaction document already exist with the same paymentIntentId, then we have
    // already processed it and given the user their urbux. Because Stripe retries a webhook
    // indefinitely when there are failures, we will respond with a 200 status code so it does
    // not attempt to retry again. This makes this endpoint operation idempotent.
    return;
  }

  const user = await User.findById(userId).session(session);
  if (user == null) {
    const err = new Error(`Could not find user with provided userId (userId=${userId})`);
    err.status = StatusCodes.NOT_FOUND;
    throw err;
  }

  user.urbux += urbuxAmount;
  await user.save({ session });

  const newCurrencyToUrbuxTransaction = new CurrencyToUrbuxTransaction({
    paymentIntentId: succeededPaymentIntent.id,
    user: userId,
    urbux: paymentAmount,
    paymentIntent: succeededPaymentIntent,
  });

  await newCurrencyToUrbuxTransaction.save({ session });
});

const DEFAULT_DISCONNECT_TIMEOUT_SECS = 30;

async function createUserSocket(socket, room, serviceInstanceId) {
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
      serviceInstance: serviceInstanceId,
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

async function deleteUserSocket(io, logger, roomId, user, socketId) {
  const room = await Room.findById(roomId);
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
      user: user.id,
      socketId: { $ne: socketId },
    }, { game: room.game }).session(session).exec();

    const operationPromises = [UserSocket.deleteOne({ socketId }).session(session).exec()];

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
  logger.info('finished deleteSocket transaction',
    {
      socketId,
      userId: user.id,
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
        user: user.id,
      }).exec();

      if (existingUserGameSocketPair == null) {
        try {
          logger.info('started kicking user from room');
          const { room: roomRes, roomState } = await quitRoomTransaction(
            logger, user, room.id,
          );
          await populateRoomAndNotify(io, roomRes, roomState);
          logger.info('finished kicking user from room');
        } catch (error) {
          logger.error('error while trying to kick player', error);
        }
      } else {
        logger.info('disconnect timeout thwarted', { existingUserGameSocketPair });
      }
    }, DEFAULT_DISCONNECT_TIMEOUT_SECS * 1000);
  }
}

module.exports = {
  generateRandomUniqueUsername,
  handlePaymentTransaction,
  deleteUserSocket,
  createUserSocket,
};
