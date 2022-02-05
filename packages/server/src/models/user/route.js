const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');

const logger = require('../../logger');
const auth = require('../../middleware/auth');
const User = require('./user');
const { generateRandomUniqueUsername } = require('./util');
const { UserNotFoundError } = require('./errors');

const PATH = '/user';
const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  const { user } = req;
  if (!user) {
    const err = new UserNotFoundError();
    err.status = StatusCodes.NOT_FOUND;
    throw err;
  } else {
    res.status(StatusCodes.OK).json({ user });
  }
});

router.post('/', asyncHandler(async (req, res) => {
  const { user, decodedToken } = req;
  if (!user) {
    logger.info(`attempting to create account for firebase uid: ${decodedToken.uid}`);
    const newUser = new User({
      firebaseId: req.decodedToken.uid,
      signInProvider: req.decodedToken.firebase.sign_in_provider,
      username: await generateRandomUniqueUsername(decodedToken.uid),
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

module.exports = {
  router,
  PATH,
};
