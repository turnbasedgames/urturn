const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const admin = require('firebase-admin');

const User = require('../models/user/user');

const rawAuthMiddleware = async (logger, token, setUser, sendUnAuthorizedError, next) => {
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch (firebaseError) {
    return sendUnAuthorizedError(firebaseError);
  }
  if (!decodedToken) {
    return sendUnAuthorizedError(new Error('Did not provide auth token'));
  }
  logger.info('firebase decodedToken', decodedToken);
  const user = await User.findOne({ firebaseId: decodedToken.uid });
  logger.info(`user found: ${user && user.id}`);
  setUser(user, decodedToken);
  return next();
};

module.exports = {
  // We aren't using built in socketio express middleware wrapper because it requires errors be
  // provided through next() function call. The express auth middleware sends 401 without calling
  // next()
  // https://socket.io/docs/v3/middlewares/#compatibility-with-express-middleware
  socketioAuthMiddelware: (socket, next) => {
    rawAuthMiddleware(
      socket.logger,
      socket.handshake.auth.token,
      (user, decodedToken) => {
        // disabled because we have to modify the socket properties to attach the associated user
        /* eslint-disable no-param-reassign */
        socket.data.user = user;
        socket.data.decodedToken = decodedToken;
        /* eslint-enable no-param-reassign */
      },
      next, // directly pass the error as socketio will not allow the connection when this happens
      next,
    );
  },
  expressUserAuthMiddleware: asyncHandler(async (req, res, next) => {
    await rawAuthMiddleware(
      req.log,
      req.headers.authorization,
      (user, decodedToken) => {
        req.user = user;
        req.decodedToken = decodedToken;
      },
      (err) => {
        res.status(StatusCodes.UNAUTHORIZED).json(err);
      },
      next,
    );
  }),
};
