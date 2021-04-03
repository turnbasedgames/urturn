const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');
const mongoose = require('mongoose');
const assert = require('assert').strict;

const Joi = require('../../middleware/joi');
const auth = require('../../middleware/auth');
const Game = require('../game/game');
const Room = require('./room');
const RoomUser = require('./roomUser');

const PATH = '/room';
const router = express.Router();

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
  await mongoose.connection.transaction(async (session) => {
    const gameCount = await Game.countDocuments({ _id: room.game });
    assert(gameCount === 1, 'room.game must exist!');
    await room.save({ session });
    await roomUser.save({ session });
  });
  await room.populate('leader').populate('game').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
  res.status(StatusCodes.CREATED).json({ room });
}));

router.post('/:id/join', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const room = await Room.findById(id);
  const roomUser = new RoomUser({ room: room.id, user: userId });
  await roomUser.save();
  await room.populate('leader').populate('game').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
  res.status(StatusCodes.CREATED).json({ room });
}));

router.get('/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const room = await Room.findById(id).populate('leader').populate('game').populate({ path: 'game', populate: { path: 'creator' } });
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

module.exports = {
  router,
  PATH,
};
