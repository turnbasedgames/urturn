const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');
const Joi = require('../../middleware/joi');

const auth = require('../../middleware/auth');
const Game = require('./game');

const PATH = '/game';
const router = express.Router();

router.get('/',
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      limit: Joi.number().integer().max(100).min(0)
        .default(25),
      skip: Joi.number().integer().min(0).default(0),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { query } = req;
    const { limit, skip } = query;
    const games = await Game.find({}).populate('creator').skip(skip).limit(limit);
    res.status(StatusCodes.OK).json({ games });
  }));

router.get('/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const game = await Game.findById(id).populate('creator');
    res.status(StatusCodes.OK).json({ game });
  }));

router.post('/', auth, asyncHandler(async (req, res) => {
  const gameRaw = req.body;
  gameRaw.creator = req.user.id;
  const game = new Game(gameRaw);
  await game.save();
  await game.populate('creator').execPopulate();
  res.status(StatusCodes.CREATED).json({ game });
}));

module.exports = {
  router,
  PATH,
};
