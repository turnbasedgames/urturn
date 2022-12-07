const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');
const mongoose = require('mongoose');

const Joi = require('../../middleware/joi');
const { expressUserAuthMiddleware } = require('../../middleware/auth');
const Game = require('../game/game');
const Room = require('./room');
const RoomState = require('./roomState');
const UserCode = require('./userCode');
const fetchUserCodeFromGame = require('./runner');
const {
  RoomNotJoinableError, RoomFinishedError, UserNotInRoomError, CreatorError, UserAlreadyInRoomError,
} = require('./errors');
const { applyCreatorResult, handlePostRoomOperation, quitRoomTransaction } = require('./util');

const PATH = '/room';
const router = express.Router();

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
        finished: Joi.boolean(),
        limit: Joi.number().integer().max(100).min(0)
          .default(25),
        containsPlayer: Joi.objectId(),
        containsInactivePlayer: Joi.objectId(),
        omitPlayer: Joi.objectId(),
        skip: Joi.number().integer().min(0).default(0),
        privateRooms: Joi.boolean(),
      }),
    }),
    expressUserAuthMiddleware,
    asyncHandler(async (req, res) => {
      const {
        query: {
          containsPlayer, containsInactivePlayer, omitPlayer, gameId, joinable, finished, limit,
          skip, privateRooms,
        },
        user,
      } = req;
      const userQuery = { players: {} };
      const userQueried = Boolean(containsPlayer || omitPlayer);

      const privateInfo = {};

      if ((privateRooms === true || privateRooms === undefined)) {
        if (!containsPlayer && !containsInactivePlayer) {
          const err = new Error('privateRooms has to be specified with containsPlayer or containsInactivePlayer');
          err.status = StatusCodes.BAD_REQUEST;
          throw err;
        } else if (!((containsPlayer && containsPlayer.equals(user.id))
            || (containsInactivePlayer && containsInactivePlayer.equals(user.id)))) {
          const err = new Error('unauthorized');
          err.status = StatusCodes.UNAUTHORIZED;
          throw err;
        }
      }

      if (privateRooms !== undefined) {
        privateInfo.private = privateRooms;
      }

      if (containsPlayer) {
        userQuery.players.$eq = containsPlayer;
      }

      if (omitPlayer) {
        userQuery.players.$ne = omitPlayer;
      }

      const rooms = await Room.find({
        ...(gameId && { game: gameId }),
        ...(joinable !== undefined && { joinable }),
        ...(finished !== undefined && { finished }),
        ...(containsInactivePlayer && { inactivePlayers: { $eq: containsInactivePlayer } }),
        ...(userQueried && userQuery),
        ...privateInfo,
      }).populate('game')
        .populate('players')
        .skip(skip)
        .limit(limit);
      res.status(StatusCodes.OK).json({ rooms });
    }));

  async function createRoomHelper(user, logger, roomBody) {
    logger.info('creating room', { userId: user.id, roomBody });
    const room = new Room(roomBody);
    room.players = [user];
    const player = user.getCreatorDataView();

    let error;

    const gameCount = await Game.countDocuments({ _id: room.game });
    if (gameCount === 0) {
      error = new Error('game must exist!');
      error.status = StatusCodes.BAD_REQUEST;
      return { room: undefined, error };
    }

    await room.populate('players').populate('game').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
    const userCode = await fetchUserCodeFromGame(logger, room.game);
    const roomState = new RoomState({
      room: room.id,
      version: 0,
    });
    const creatorInitRoomState = userCode.startRoom(room, roomState);
    roomState.applyCreatorData(creatorInitRoomState);
    const creatorJoinRoomState = userCode.playerJoin(player, room, roomState);
    roomState.applyCreatorData(creatorJoinRoomState);
    room.applyCreatorRoomState(creatorJoinRoomState);
    room.latestState = roomState.id;

    await mongoose.connection.transaction(async (session) => {
      await room.save({ session });
      await roomState.save({ session });
    });

    io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, roomState));
    await room.populate('latestState').execPopulate();

    return { room, error };
  }

  async function joinRoomHelper(user, logger, room) {
    logger.info('joining user to room', { userId: user.id, roomId: room.id });
    const player = user.getCreatorDataView();

    let error;
    let newRoomState;
    try {
      await mongoose.connection.transaction(async (session) => {
        room.playerJoin(user);
        const prevRoomState = room.latestState;
        const userCode = await fetchUserCodeFromGame(logger, room.game);
        const creatorJoinRoomState = userCode.playerJoin(player, room, prevRoomState);
        newRoomState = await applyCreatorResult(
          prevRoomState,
          room,
          creatorJoinRoomState,
          session,
        );
      });

      return { room, newRoomState, error };
    } catch (err) {
      if (err instanceof RoomFinishedError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof CreatorError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof RoomNotJoinableError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof UserAlreadyInRoomError) {
        err.status = StatusCodes.BAD_REQUEST;
      }

      return { room: undefined, newRoomState, error: err };
    }
  }

  router.put('/',
    celebrate({
      [Segments.BODY]: Joi.object().keys({
        private: Joi.boolean().default(false),
        game: Joi.objectId(),
      }),
    }),
    expressUserAuthMiddleware,
    asyncHandler(async (req, res) => {
    // The functionality of this endpoint is to simulate queue mechanism:
    //    1. If the user is trying to create a private room, create it and exit handler.
    //    2. If there exists rooms for the user to join, join the user to the room and exit handler.
    //    3. The first two aforementioned conditions were not true, so create public room.
      const { user } = req;
      const { private: isPrivate, game } = req.body;

      if (isPrivate) {
        const { room, error } = await createRoomHelper(user, req.log, { game, private: isPrivate });
        if (error) {
          throw error;
        }

        res.status(StatusCodes.CREATED).json({ room });
        return;
      }

      const roomToJoin = await Room.findOne({
        joinable: true,
        game,
        finished: false,
        // Users can only queue up in public rooms
        private: false,
        players: {
          $ne: user.id,
        },
      }).populate('game')
        .populate('players')
        .populate('latestState')
        .exec();

      if (roomToJoin) {
        const { room, newRoomState, error } = await joinRoomHelper(user, req.log, roomToJoin);
        if (error) {
          throw error;
        }

        await handlePostRoomOperation(res, io, room, newRoomState);
        return;
      }

      const { room, error } = await createRoomHelper(user, req.log, { game });
      if (error) {
        throw error;
      }

      res.status(StatusCodes.CREATED).json({ room });
    }));

  router.post('/:id/reset', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), expressUserAuthMiddleware, asyncHandler(async (req, res) => {
    const { user } = req;
    const player = user.getCreatorDataView();
    const { id } = req.params;

    const roomLean = await Room.findById(id, 'game').populate('game').lean().exec();
    if (roomLean == null) {
      const error = new Error('room must exist!');
      error.status = StatusCodes.BAD_REQUEST;
      throw error;
    }
    if (roomLean.game == null) {
      const error = new Error('game must exist!');
      error.status = StatusCodes.BAD_REQUEST;
      throw error;
    }

    const userCode = await fetchUserCodeFromGame(req.log, roomLean.game);
    let room;
    let roomState;
    await mongoose.connection.transaction(async (session) => {
      room = await Room.findById(id).populate('latestState').session(session);
      room.privateRoomReset();
      roomState = new RoomState({
        room: room.id,
        version: room.latestState.version + 1,
      });
      const creatorInitRoomState = userCode.startRoom(room, roomState);
      roomState.applyCreatorData(creatorInitRoomState);
      const creatorJoinRoomState = userCode.playerJoin(player, room, roomState);
      roomState.applyCreatorData(creatorJoinRoomState);
      room.applyCreatorRoomState(creatorJoinRoomState);
      room.latestState = roomState.id;
      await Promise.all([room.save({ session }), roomState.save({ session })]);
    });
    await handlePostRoomOperation(res, io, room, roomState);
  }));

  router.post('/:id/join', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), expressUserAuthMiddleware, asyncHandler(async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const roomToJoin = await Room.findById(id).populate('game').populate('players').populate('latestState')
      .exec();

    const { room, newRoomState, error } = await joinRoomHelper(user, req.log, roomToJoin);
    if (error) {
      throw error;
    }

    await handlePostRoomOperation(res, io, room, newRoomState);
  }));

  router.post('/:id/move', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), expressUserAuthMiddleware, asyncHandler(async (req, res) => {
    const { user } = req;
    const player = user.getCreatorDataView();
    const { id } = req.params;
    const move = req.body;

    try {
      let room;
      let newRoomState;
      await mongoose.connection.transaction(async (session) => {
        room = await Room.findById(id).populate('game').populate('players').populate('latestState')
          .session(session);
        room.playerMove(player);
        const prevRoomState = room.latestState;
        const userCode = await fetchUserCodeFromGame(req.log, room.game);
        const creatorMoveRoomState = userCode.playerMove(player, move, room, prevRoomState);
        newRoomState = await applyCreatorResult(prevRoomState, room, creatorMoveRoomState, session);
      });
      await handlePostRoomOperation(res, io, room, newRoomState);
    } catch (err) {
      if (err instanceof RoomFinishedError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof CreatorError) {
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
  }), expressUserAuthMiddleware, asyncHandler(async (req, res) => {
    const { user } = req;
    const { id: roomId } = req.params;
    try {
      const { room, roomState } = await quitRoomTransaction(req.log, user, roomId);
      await handlePostRoomOperation(res, io, room, roomState);
    } catch (err) {
      if (err instanceof RoomFinishedError) {
        err.status = StatusCodes.BAD_REQUEST;
      } else if (err instanceof CreatorError) {
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
