const express = require('express');
const admin = require('firebase-admin');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { celebrate, Segments } = require('celebrate');

const Joi = require('../../middleware/joi');
const { expressUserAuthMiddleware } = require('../../middleware/auth');
const { stripeClient, webhookSecret } = require('../../utils/stripe');
const User = require('./user');
const { generateRandomUniqueUsername, handlePaymentTransaction } = require('./util');
const { UserNotFoundError } = require('./errors');
const { ALLOWED_CURRENCIES_SET, USD_TO_URBUX, convertAmountToUrbux } = require('../transaction/util');

const PATH = '/user';
const router = express.Router();

router.get('/',
  expressUserAuthMiddleware,
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

router.post('/', expressUserAuthMiddleware, asyncHandler(async (req, res) => {
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
router.post('/create-payment-intent', expressUserAuthMiddleware, asyncHandler(async (req, res) => {
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
    req.log.error('An error occurred while hitting stripe\'s API upon creating payment intent', error);
    const err = new Error('internal server error');
    err.status = StatusCodes.INTERNAL_SERVER_ERROR;
    throw err;
  }
}));

router.post('/purchase/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  let event;
  try {
    const { body } = req;
    const sig = req.headers['stripe-signature'];
    event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    err.status = StatusCodes.BAD_REQUEST;
    req.log.error('validation for stripe webhook has failed', { error: err });
    throw err;
  }

  if (event.type !== 'payment_intent.succeeded') {
    // By default we will respond 200 even when we don't understand the event.type so that
    // stripe does not continue retrying failed request to our webhook endpoint
    req.log.info('unhandled stripe webhook event', { event });
    res.sendStatus(200);
    return;
  }

  const succeededPaymentIntent = event.data.object;
  const { userId } = succeededPaymentIntent.metadata;
  const paymentAmount = succeededPaymentIntent.amount;

  if (userId == null) {
    const err = new Error('"event.data.object.metadata.userId" was not provided!');
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }

  const urbuxAmount = convertAmountToUrbux(succeededPaymentIntent.currency, paymentAmount);
  if (urbuxAmount === undefined) {
    const err = new Error(`conversion to urbux failed (currency=${succeededPaymentIntent.currency}, paymentAmount=${paymentAmount})`);
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }

  await handlePaymentTransaction(
    req.log, userId, urbuxAmount, paymentAmount, succeededPaymentIntent,
  );

  res.sendStatus(200);
}));

router.delete('/', expressUserAuthMiddleware, asyncHandler(async (req, res) => {
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
