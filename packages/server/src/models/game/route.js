const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');
const mongoose = require('mongoose');

const Joi = require('../../middleware/joi');
const auth = require('../../middleware/auth');
const Game = require('./game');
const logger = require('../../logger');

const PATH = '/game';
const router = express.Router();

router.get('/',
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      limit: Joi.number().integer().max(100).min(0)
        .default(25),
      skip: Joi.number().integer().min(0).default(0),
      creator: Joi.objectId().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { query } = req;
    const { limit, skip, ...mongoQuery } = query;
    const games = await Game.find(mongoQuery).populate('creator').skip(skip).limit(limit);
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
    if (game) {
      res.status(StatusCodes.OK).json({ game });
    } else {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  }));

router.post('/', auth, asyncHandler(async (req, res) => {
  const { body: gameRaw, user } = req;
  gameRaw.creator = user.id;
  const game = new Game(gameRaw);

  await mongoose.connection.transaction(async (session) => {
    await game.save({ session });
    await game.addGameTemplateFiles(user.firebaseId);
  });
  await game.populate('creator').execPopulate();
  res.status(StatusCodes.CREATED).json({ game });
}));

// TODO: validation on the body, oldBody.save() does not catch it
router.put('/:id', auth,
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { body: gameRaw, user } = req;
    const oldGame = await Game.findById(id);

    if (oldGame) {
      if (oldGame.creator.toString() === user.id.toString()) {
        Object.keys(gameRaw).forEach((key) => {
          oldGame[key] = gameRaw[key];
        });
        await oldGame.save();
        await oldGame.populate('creator').execPopulate();
        res.status(StatusCodes.OK).json({ game: oldGame });
      } else {
        logger.info(`user ${user.id} not allowed to update game ${id} created by ${oldGame.creator}`);
        res.sendStatus(StatusCodes.UNAUTHORIZED);
      }
    } else {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  }));

// TODO: soft delete
// TODO: how do we want to handle deleting all game rooms?
router.delete('/:id', auth,
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.objectId(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const game = await Game.findById(id);

    if (game) {
      if (game.creator.toString() === user.id.toString()) {
        await game.deleteOne();
        res.sendStatus(StatusCodes.OK);
      } else {
        logger.info(`user ${user.id} not allowed to delete game ${id} created by ${game.creator}`);
        res.sendStatus(StatusCodes.UNAUTHORIZED);
      }
    } else {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  }));

module.exports = {
  router,
  PATH,
};
