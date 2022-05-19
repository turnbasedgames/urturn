const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const admin = require('firebase-admin');

const User = require('../models/user/user');

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
    req.log.info('firebase decodedToken', decodedToken);
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    req.log.info(`user found: ${user && user.id}`);
    req.user = user;
    req.decodedToken = decodedToken;
    next();
  }
});
