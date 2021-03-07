const express = require('express');
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');

const logger = require('../../logger');
const auth = require('./auth');
const User = require('./user');

// const User = require('./user');

const PATH = '/user';
const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  const { user } = req;
  if (!user) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  } else {
    res.status(StatusCodes.OK).json({ user });
  }
});

router.post('/', asyncHandler(async (req, res) => {
  const { user, decodedToken } = req;
  if (!user) {
    logger.info(`attempting to create account for: ${decodedToken.uid}`);
    const newUser = new User({
      firebaseId: req.decodedToken.uid,
      signInProvider: req.decodedToken.firebase.sign_in_provider,
    });
    await newUser.save();
    logger.info(`created account for: ${decodedToken.uid} user: ${newUser.id}`);
    res.status(StatusCodes.CREATED).json({
      user: newUser,
    });
  } else {
    res.sendStatus(StatusCodes.CONFLICT);
  }
}));

router.delete('/', (req, res) => {
  logger.info('attempting to delete account for:', req.decodedToken);
  res.sendStatus(StatusCodes.OK);
});

module.exports = {
  router,
  PATH,
};
