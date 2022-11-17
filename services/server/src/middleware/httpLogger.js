const lw = require('@google-cloud/logging-winston');
const { createLogger } = require('winston');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

const setupExpressLoggerMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return lw.express.makeMiddleware(createLogger());
  }

  return (req, res, next) => {
    const requestId = req.get('x-request-id') ?? `req-${uuidv4()}`;
    const correlationId = req.get('x-correlation-id') ?? `cid-${uuidv4()}`;
    const childLogger = logger.child({ requestId, correlationId });
    req.log = childLogger;

    res.set('x-request-id', requestId);
    res.set('x-correlation-id', correlationId);
    next();
  };
};

// gcp logger middleware does not support socketio officially, so just use default logger
const socketioLoggerMiddleware = (socket, next) => {
  const requestId = socket.request.headers['x-request-id'] ?? socket.id;
  const correlationId = socket.request.headers['x-correlation-id'] ?? `cid-${uuidv4()}`;
  const childLogger = logger.child({ requestId, correlationId });
  // eslint-disable-next-line no-param-reassign
  socket.logger = childLogger;
  return next();
};

module.exports = {
  socketioLoggerMiddleware,
  setupExpressLoggerMiddleware,
};
