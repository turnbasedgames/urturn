const admin = require('firebase-admin');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const logger = require('../logger');
const User = require('../models/user/user');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

module.exports = asyncHandler(async (req, res, next) => {
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(req.headers.authorization);
  } catch (firebaseError) {
    res.status(StatusCodes.UNAUTHORIZED).json(firebaseError);
    return;
  }
  if (!decodedToken) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  } else {
    logger.info(`decoded token: ${decodedToken.uid}`);
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    logger.info(`User found: ${user && user.id}`);

    req.user = user;
    req.decodedToken = decodedToken;
    next();
  }
});
