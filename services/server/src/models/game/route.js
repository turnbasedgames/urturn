const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');

const Joi = require('../../middleware/joi');
const { expressUserAuthMiddleware } = require('../../middleware/auth');
const Game = require('./game');

const PATH = '/game';
const router = express.Router();

router.get('/',
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      limit: Joi.number().integer().max(100).min(0)
        .default(25),
      skip: Joi.number().integer().min(0).default(0),
      creator: Joi.objectId().optional(),
      searchText: Joi.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { query } = req;
    const {
      limit, skip, searchText, ...mongoQuery
    } = query;

    if (searchText) {
      mongoQuery.$text = {
        $search: searchText,
      };
    }

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

router.post('/', expressUserAuthMiddleware, asyncHandler(async (req, res) => {
  const { body: gameRaw, user } = req;
  const game = new Game(gameRaw);
  game.creator = user.id;
  await game.updateByUser(gameRaw);
  await game.populate('creator').execPopulate();
  res.status(StatusCodes.CREATED).json({ game });
}));

router.put('/:id', expressUserAuthMiddleware,
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
      if (oldGame.creator.equals(user.id)) {
        await oldGame.updateByUser(gameRaw);
        await oldGame.populate('creator').execPopulate();
        res.status(StatusCodes.OK).json({ game: oldGame });
      } else {
        req.log.info('user is not allowed to update the game', {
          userId: user.id,
          gameId: id,
          creatorId: oldGame.creator,
        });
        res.sendStatus(StatusCodes.UNAUTHORIZED);
      }
    } else {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  }));

// TODO: soft delete
// TODO: how do we want to handle deleting all game rooms?
router.delete('/:id', expressUserAuthMiddleware,
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
        req.log.info('user is not allowed to delete the game', {
          userId: user.id,
          gameId: id,
          creatorId: game.creator,
        });
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
