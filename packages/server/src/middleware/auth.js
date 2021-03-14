const admin = require('firebase-admin');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const logger = require('../logger');
const User = require('../models/user/user');

console.log(`start${process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64}end`);

admin.initializeApp({
  credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? admin.credential.applicationDefault()
    : admin.credential.cert(JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('ascii'))),
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
    logger.info(`firebase id: ${decodedToken.uid}`);
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    logger.info(`user found: ${user && user.id}`);

    req.user = user;
    req.decodedToken = decodedToken;
    next();
  }
});
