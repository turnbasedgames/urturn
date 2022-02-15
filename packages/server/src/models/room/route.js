const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');
const mongoose = require('mongoose');

const Joi = require('../../middleware/joi');
const auth = require('../../middleware/auth');
const Game = require('../game/game');
const Room = require('./room');
const RoomState = require('./roomState');
const UserCode = require('./runner');
const {
  RoomNotJoinableError, RoomFinishedError, UserNotInRoomError, CreatorInvalidMoveError,
} = require('./errors');

const PATH = '/room';
const router = express.Router();

function guardFinishedRoom(room) {
  if (room.finished) {
    throw new RoomFinishedError(room);
  }
}

async function applyCreatorResult(prevRoomState, room, creatorRoomState, session) {
  const newRoomState = prevRoomState;
  // eslint-disable-next-line no-underscore-dangle
  newRoomState._id = mongoose.Types.ObjectId();
  newRoomState.isNew = true;
  newRoomState.version += 1;
  newRoomState.applyCreatorData(creatorRoomState);
  room.applyCreatorRoomState(creatorRoomState, newRoomState.id);
  room.markModified('latestState');
  await newRoomState.save({ session });
  await room.save({ session });
  return newRoomState;
}

// TODO: what happens when a game makes a backwards incompatible change to existing rooms?
// TODO: determine what to do is usercode errors during quitting and/or joining,
//       moves erroring just returns to userfrontend
// TODO: include what caused latest state change in event? e.g. onPlayerMove, or onPlayerJoin
function setupRouter({ io }) {
  router.get('/',
    celebrate({
      [Segments.QUERY]: Joi.object().keys({
        gameId: Joi.objectId(),
        joinable: Joi.boolean(),
        limit: Joi.number().integer().max(100).min(0)
          .default(25),
        containsPlayer: Joi.objectId(),
        containsInactivePlayer: Joi.objectId(),
        omitPlayer: Joi.objectId(),
        skip: Joi.number().integer().min(0).default(0),
      }),
    }),
    asyncHandler(async (req, res) => {
      const {
        query: {
          containsPlayer, containsInactivePlayer, omitPlayer, gameId, joinable, limit, skip,
        },
      } = req;
      const userQuery = { players: {} };
      const userQueried = Boolean(containsPlayer || omitPlayer);
      if (containsPlayer) {
        userQuery.players.$eq = containsPlayer;
      }
      if (omitPlayer) {
        userQuery.players.$ne = omitPlayer;
      }
      const rooms = await Room.find({
        ...(gameId && { game: gameId }),
        ...(joinable !== undefined && { joinable }),
        ...(containsInactivePlayer && { inactivePlayers: { $eq: containsInactivePlayer } }),
        ...(userQueried && userQuery),
      }).populate('game')
        .populate('players')
        .skip(skip)
        .limit(limit);
      res.status(StatusCodes.OK).json({ rooms });
    }));

  router.post('/', auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const roomRaw = req.body;
    const room = new Room(roomRaw);
    room.players = [req.user];

    const gameCount = await Game.countDocuments({ _id: room.game });
    if (gameCount === 0) {
      const err = new Error('room.game must exist!');
      err.status = StatusCodes.BAD_REQUEST;
      throw err;
    }

    await room.populate('players').populate('game').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
    const userCode = await UserCode.fromGame(room.game);
    const creatorInitRoomState = userCode.startRoom();
    const roomState = new RoomState({
      room: room.id,
      version: 0,
    });
    roomState.applyCreatorData(creatorInitRoomState);
    const creatorJoinRoomState = userCode.playerJoin(userId, room, roomState);
    roomState.applyCreatorData(creatorJoinRoomState);
    room.applyCreatorRoomState(creatorJoinRoomState);
    room.latestState = roomState.id;
    await mongoose.connection.transaction(async (session) => {
      await room.save({ session });
      await roomState.save({ session });
    });

    io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, roomState));
    await room.populate('latestState').execPopulate();
    res.status(StatusCodes.CREATED).json({ room });
  }));

  router.post('/:id/join', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    let room = await Room.findById(id).populate('game');
    const userCode = await UserCode.fromGame(room.game);

    let newRoomState;
    try {
      await mongoose.connection.transaction(async (session) => {
        room = await Room.findById(id).populate('latestState').session(session);
        guardFinishedRoom(room);
        if (!room.joinable) {
          throw new RoomNotJoinableError(room);
        }
        room.players.push(req.user);
        const prevRoomState = room.latestState;
        const creatorJoinRoomState = userCode.playerJoin(userId, room, prevRoomState);
        newRoomState = await applyCreatorResult(prevRoomState, room, creatorJoinRoomState, session);
      });

      // publishing message is not part of the transaction because subscribers can
      // receive the message before mongodb updates the database
      io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, newRoomState));
      await room.populate('players').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();

      // TODO: how do we standardized the creatorRoomState
      res.status(StatusCodes.OK).json({ room });
    } catch (err) {
      if (err instanceof RoomFinishedError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof RoomNotJoinableError) {
        err.status = StatusCodes.BAD_REQUEST;
      }
      throw err;
    }
  }));

  router.post('/:id/move', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const move = req.body;

    try {
      let room = await Room.findById(id).populate('game');
      guardFinishedRoom(room);
      if (!room.containsPlayer(userId)) {
        throw new UserNotInRoomError(userId, room);
      }
      const userCode = await UserCode.fromGame(room.game);
      let newRoomState;
      await mongoose.connection.transaction(async (session) => {
        room = await Room.findById(id).populate('latestState').session(session);
        const prevRoomState = room.latestState;
        const creatorMoveRoomState = userCode.playerMove(userId, move, room, prevRoomState);
        newRoomState = await applyCreatorResult(prevRoomState, room, creatorMoveRoomState, session);
      });
      // publishing message is not part of the transaction because subscribers can
      // receive the message before mongodb updates the database
      io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, newRoomState));
      await room.populate('players').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
      res.status(StatusCodes.OK).json({ room });
    } catch (err) {
      if (err instanceof RoomFinishedError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof CreatorInvalidMoveError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof UserNotInRoomError) {
        err.status = StatusCodes.BAD_REQUEST;
      }
      throw err;
    }
  }));

  router.post('/:id/quit', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      let room = await Room.findById(id).populate('game');
      guardFinishedRoom(room);
      if (!room.containsPlayer(userId)) {
        throw new UserNotInRoomError(userId, room);
      }
      const userCode = await UserCode.fromGame(room.game);
      let newRoomState;
      await mongoose.connection.transaction(async (session) => {
        room = await Room.findById(id).populate('latestState').session(session);
        room.playerQuit(userId);
        const prevRoomState = room.latestState;
        const creatorQuitRoomState = userCode.playerQuit(userId, room, prevRoomState);
        newRoomState = await applyCreatorResult(prevRoomState, room, creatorQuitRoomState, session);
      });
      // publishing message is not part of the transaction because subscribers can
      // receive the message before mongodb updates the database
      io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, newRoomState));
      await room.populate('players').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
      res.status(StatusCodes.OK).json({ room });
    } catch (err) {
      if (err instanceof RoomFinishedError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof UserNotInRoomError) {
        err.status = StatusCodes.BAD_REQUEST;
      }
      throw err;
    }
  }));

  router.get('/:id',
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: Joi.objectId(),
      }),
    }), asyncHandler(async (req, res) => {
      const { id } = req.params;
      const room = await Room.findById(id)
        .populate('latestState')
        .populate('players')
        .populate('inactivePlayers')
        .populate('game')
        .populate({ path: 'game', populate: { path: 'creator' } });
      res.status(StatusCodes.OK).json({ room });
    }));

  return router;
}

module.exports = {
  setupRouter,
  PATH,
};
