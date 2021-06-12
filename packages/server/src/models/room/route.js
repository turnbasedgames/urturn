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
const RoomUser = require('./roomUser');
const { getUserCode } = require('./runner');

const PATH = '/room';
const router = express.Router();

function setupRouter({ io }) {
  router.get('/',
    celebrate({
      [Segments.QUERY]: Joi.object().keys({
        gameId: Joi.objectId().required(),
        limit: Joi.number().integer().max(100).min(0)
          .default(25),
        skip: Joi.number().integer().min(0).default(0),
      }),
    }),
    asyncHandler(async (req, res) => {
      const { query: { gameId, limit, skip } } = req;
      const rooms = await Room.find({ game: gameId }).populate('game').populate('leader').skip(skip)
        .limit(limit);
      res.status(StatusCodes.OK).json({ rooms });
    }));

  router.post('/', auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const roomRaw = req.body;
    const room = new Room({ ...roomRaw, leader: userId });
    const roomUser = new RoomUser({ room: room.id, user: userId });

    const gameCount = await Game.countDocuments({ _id: room.game });
    if (gameCount !== 1) {
      const err = new Error('room.game must exist!');
      err.status = StatusCodes.BAD_REQUEST;
      throw err;
    }

    await room.populate('leader').populate('game').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
    const userCode = await getUserCode(room.game);
    const roomState = new RoomState({
      room: room.id,
      state: userCode.joinPlayer(userId, userCode.startRoom()),
      version: 0,
    });
    room.latestState = roomState.id;
    await mongoose.connection.transaction(async (session) => {
      await room.save({ session });
      await roomUser.save({ session });
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
    const roomUser = new RoomUser({ room: room.id, user: userId });
    await roomUser.validate();

    let newRoomState;
    await mongoose.connection.transaction(async (session) => {
      await roomUser.save({ session });
      room = await Room.findById(id).populate('latestState').session(session);
      const prevRoomState = room.latestState;
      newRoomState = new RoomState({
        room: room.id,
        state: userCode.joinPlayer(userId, prevRoomState.state),
        version: prevRoomState.version + 1,
      });
      await newRoomState.save({ session });
      room.latestState = newRoomState.id;
      room.markModified('latestState');
      await room.save({ session });
    });

    // publishing message is not part of the transaction because subscribers can
    // receive the message before mongodb updates the database
    io.to(room.id).emit('room:latestState', newRoomState);
    await room.populate('leader').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
    res.status(StatusCodes.CREATED).json({ room });
  }));

  router.post('/:id/move', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), auth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const move = req.body;

    if (!(await RoomUser.isUserInRoom(id, userId))) {
      const err = new Error('user is not in room!');
      err.status = StatusCodes.BAD_REQUEST;
      throw err;
    }

    let room = await Room.findById(id).populate('game');
    const userCode = await getUserCode(room.game);

    let newRoomState;
    await mongoose.connection.transaction(async (session) => {
      room = await Room.findById(id).populate('latestState').session(session);
      const prevRoomState = room.latestState;
      newRoomState = new RoomState({
        room: room.id,
        state: userCode.playerMove(userId, move, prevRoomState.state),
        version: prevRoomState.version + 1,
      });
      room.latestState = newRoomState.id;
      room.markModified('latestState');
      await newRoomState.save({ session });
      await room.save({ session });
    });

    // publishing message is not part of the transaction because subscribers can
    // receive the message before mongodb updates the database
    io.to(room.id).emit('room:latestState', newRoomState);
    res.sendStatus(StatusCodes.OK);
  }));

  router.get('/:id',
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: Joi.objectId(),
      }),
    }), asyncHandler(async (req, res) => {
      const { id } = req.params;
      const room = await Room.findById(id).populate('latestState').populate('leader').populate('game')
        .populate({ path: 'game', populate: { path: 'creator' } });
      res.status(StatusCodes.OK).json({ room });
    }));

  router.get('/:id/user',
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: Joi.objectId(),
      }),
    }), asyncHandler(async (req, res) => {
      const { id } = req.params;
      const roomUsers = await RoomUser.find({ room: id }).populate('user');
      res.status(StatusCodes.OK).json({ users: roomUsers.map((roomUser) => roomUser.user) });
    }));

  router.get('/:roomId/user/:userId',
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        roomId: Joi.objectId(),
        userId: Joi.objectId(),
      }),
    }), asyncHandler(async (req, res) => {
      const { roomId, userId } = req.params;
      const roomUser = await RoomUser.find({ room: roomId, user: userId });
      if (roomUser.length >= 1) {
        res.sendStatus(StatusCodes.OK);
      } else {
        res.sendStatus(StatusCodes.NOT_FOUND);
      }
    }));

  router.get('/user/:id', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
    [Segments.QUERY]: Joi.object().keys({
      limit: Joi.number().integer().max(100).min(0)
        .default(25),
      skip: Joi.number().integer().min(0).default(0),
    }),
  }), asyncHandler(async (req, res) => {
    const { query: { limit, skip }, params: { id } } = req;
    const roomUsers = await RoomUser
      .find({ user: id })
      .populate('room')
      .populate('room.leader')
      .populate('room.game')
      .populate('room.game.creator')
      .skip(skip)
      .limit(limit);
    res.status(StatusCodes.OK).json({ rooms: roomUsers.map((roomUser) => roomUser.room) });
  }));

  return router;
}

module.exports = {
  setupRouter,
  PATH,
};
