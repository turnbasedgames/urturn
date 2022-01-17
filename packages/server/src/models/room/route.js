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
const { getUserCode } = require('./runner');
const { RoomNotJoinable, CreatorInvalidMove } = require('./errors');

const PATH = '/room';
const router = express.Router();

// TODO: can a user leave the room?
//       example in poker where maybe nothing happens
//       example in tictactoe where leaving the game is an instant loss
//       how to differentiate between user leaving due to network issue, or user ghosting
//       also how to support long running games between players
// TODO: what happens when a game makes a backwards incompatible change to existing rooms?
function setupRouter({ io }) {
  router.get('/',
    celebrate({
      [Segments.QUERY]: Joi.object().keys({
        gameId: Joi.objectId().required(),
        joinable: Joi.boolean(),
        limit: Joi.number().integer().max(100).min(0)
          .default(25),
        containsUser: Joi.objectId(),
        omitUser: Joi.objectId(),
        skip: Joi.number().integer().min(0).default(0),
      }),
    }),
    asyncHandler(async (req, res) => {
      const {
        query: {
          containsUser, omitUser, gameId, joinable, limit, skip,
        },
      } = req;
      const userQuery = { users: {} };
      const userQueried = (containsUser !== undefined) || (omitUser !== undefined);
      if (containsUser !== undefined) {
        userQuery.users.$eq = containsUser;
      }
      if (omitUser !== undefined) {
        userQuery.users.$ne = omitUser;
      }
      const rooms = await Room.find({
        game: gameId,
        ...(joinable !== undefined && { joinable }),
        ...(userQueried && userQuery),
      }).populate('game')
        .populate('users')
        .skip(skip)
        .limit(limit);
      res.status(StatusCodes.OK).json({ rooms });
    }));

  router.post('/', auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const roomRaw = req.body;
    const room = new Room(roomRaw);
    room.users = [req.user];

    const gameCount = await Game.countDocuments({ _id: room.game });
    if (gameCount !== 1) {
      const err = new Error('room.game must exist!');
      err.status = StatusCodes.BAD_REQUEST;
      throw err;
    }

    await room.populate('users').populate('game').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
    const userCode = await getUserCode(room.game);
    const creatorInitRoomState = userCode.startRoom();
    const roomState = new RoomState({
      room: room.id,
      version: 0,
    });
    roomState.applyCreatorData(creatorInitRoomState);
    const creatorJoinRoomState = userCode.joinPlayer(userId, roomState);
    roomState.applyCreatorData(creatorJoinRoomState);
    room.applyCreatorData(creatorJoinRoomState);
    room.latestState = roomState.id;
    await mongoose.connection.transaction(async (session) => {
      await room.save({ session });
      await roomState.save({ session });
    });

    io.to(room.id).emit('room:latestState', roomState);
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
    const userCode = await getUserCode(room.game);

    let newRoomState;
    try {
      await mongoose.connection.transaction(async (session) => {
        room = await Room.findById(id).populate('latestState').session(session);
        if (!room.joinable) {
          throw new RoomNotJoinable(room);
        }
        room.users.push(req.user);

        const prevRoomState = room.latestState;
        const creatorJoinRoomState = userCode.joinPlayer(userId, prevRoomState);
        newRoomState = new RoomState({
          room: room.id,
          version: prevRoomState.version + 1,
        });
        newRoomState.applyCreatorData(creatorJoinRoomState);
        room.applyCreatorData(creatorJoinRoomState);
        room.latestState = newRoomState.id;
        room.markModified('latestState');
        await newRoomState.save({ session });
        await room.save({ session });
      });

      // publishing message is not part of the transaction because subscribers can
      // receive the message before mongodb updates the database
      io.to(room.id).emit('room:latestState', newRoomState);
      await room.populate('users').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
      res.status(StatusCodes.CREATED).json({ room });
    } catch (err) {
      if (err instanceof RoomNotJoinable) {
        res.status(StatusCodes.BAD_REQUEST).json(err.toJSON());
      } else {
        throw err;
      }
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

    let room = await Room.findById(id).populate('game').populate('users');
    if (!room.users.some((user) => user.id === userId)) {
      const err = new Error('user is not in room!');
      err.status = StatusCodes.BAD_REQUEST;
      throw err;
    }
    const userCode = await getUserCode(room.game);

    let newRoomState;
    try {
      await mongoose.connection.transaction(async (session) => {
        room = await Room.findById(id).populate('latestState').session(session);
        const prevRoomState = room.latestState;
        const creatorMoveRoomState = userCode.playerMove(userId, move, prevRoomState);
        newRoomState = new RoomState({
          room: room.id,
          version: prevRoomState.version + 1,
        });
        newRoomState.applyCreatorData(creatorMoveRoomState);
        room.latestState = newRoomState.id;
        room.markModified('latestState');
        await newRoomState.save({ session });
        await room.save({ session });
        // publishing message is not part of the transaction because subscribers can
        // receive the message before mongodb updates the database
        io.to(room.id).emit('room:latestState', newRoomState.toJSON());
        res.sendStatus(StatusCodes.OK);
      });
    } catch (err) {
      if (err instanceof CreatorInvalidMove) {
        console.log(err);
        res.status(StatusCodes.BAD_REQUEST).json(err.toJSON());
      } else {
        throw err;
      }
    }
  }));

  router.get('/:id',
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: Joi.objectId(),
      }),
    }), asyncHandler(async (req, res) => {
      const { id } = req.params;
      const room = await Room.findById(id).populate('latestState').populate('users').populate('game')
        .populate({ path: 'game', populate: { path: 'creator' } });
      res.status(StatusCodes.OK).json({ room });
    }));

  return router;
}

module.exports = {
  setupRouter,
  PATH,
};
