const lw = require('@google-cloud/logging-winston');
const { createLogger } = require('winston');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

module.exports = () => {
  if (process.env.NODE_ENV === 'production') {
    return lw.express.makeMiddleware(createLogger());
  }

  return (req, res, next) => {
    const requestId = req.get('x-request-id') ?? `req-${uuidv4()}`;
    const correlationId = req.get('x-correlation-id') ?? `cid-${uuidv4()}`;
    const childLogger = logger.child({ requestId, correlationId });
    req.log = childLogger;
    next();
  };
};
