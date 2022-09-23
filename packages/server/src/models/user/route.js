const express = require('express');
const admin = require('firebase-admin');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');

const Joi = require('../../middleware/joi');
const auth = require('../../middleware/auth');
const { stripeClient } = require('../../utils/stripe');
const User = require('./user');
const { generateRandomUniqueUsername } = require('./util');
const { UserNotFoundError } = require('./errors');
const { ALLOWED_CURRENCIES_SET, USD_TO_URBUX } = require('../transaction/util');

const PATH = '/user';
const router = express.Router();

router.use(auth);

router.get('/',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      includePrivate: Joi.boolean().default(false),
    }),
  }), (req, res) => {
    const { user, query: { includePrivate } } = req;
    if (!user) {
      const err = new UserNotFoundError();
      err.status = StatusCodes.NOT_FOUND;
      throw err;
    } else {
      res.status(StatusCodes.OK).json({ user: user.toJSON({ includePrivate }) });
    }
  });

router.post('/', asyncHandler(async (req, res) => {
  const { user, decodedToken } = req;
  if (!user) {
    req.log.info('attempting to create user document with firebase id', { firebaseId: decodedToken.uid });
    const newUser = new User({
      firebaseId: req.decodedToken.uid,
      signInProvider: req.decodedToken.firebase.sign_in_provider,
      username: await generateRandomUniqueUsername(decodedToken.uid),
    });
    await newUser.save();
    req.log.info('created new account', { firebaseId: decodedToken.uid, userId: newUser.id });
    res.status(StatusCodes.CREATED).json({
      user: newUser.toJSON({ includePrivate: true }),
    });
  } else {
    res.sendStatus(StatusCodes.CONFLICT);
  }
}));

// This route handler will handle creating the paymentIntent for the client who initiated
// this payment intent to then confirm it on the front end.
router.post('/create-payment-intent', asyncHandler(async (req, res) => {
  const { user } = req;
  const { body: { amount, currency } } = req;

  if (!ALLOWED_CURRENCIES_SET.has(currency)) {
    const err = new Error();
    err.message = 'invalid request: currency not supported.';
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }

  // We only allow increments of 100 urbux for now
  if (!Object.values(USD_TO_URBUX).includes(amount)) {
    const err = new Error();
    err.message = 'invalid request: only increments of 100 urbux are allowed.';
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId: user.id,
      },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    req.log.error(`An error occurred while hitting stripe's API upon creating payment intent ${error.message}`);
    const err = new Error('internal server error');
    err.status = StatusCodes.INTERNAL_SERVER_ERROR;
    throw err;
  }
}));

router.delete('/', asyncHandler(async (req, res) => {
  const { decodedToken, user } = req;
  const firebaseId = decodedToken.uid;

  try {
    await Promise.all([
      User.findOneAndDelete({ id: user.id }),
      admin.auth().deleteUser(firebaseId),
    ]);
  } catch (err) {
    req.log.error('error completely deleting user', err);
  } finally {
    res.sendStatus(StatusCodes.OK);
  }
}));

module.exports = {
  router,
  PATH,
};
