const lw = require('@google-cloud/logging-winston');
const { createLogger } = require('winston');
const logger = require('../logger');

module.exports = () => {
  if (process.env.NODE_ENV === 'production') {
    return lw.express.makeMiddleware(createLogger());
  }
  return (req, res, next) => {
    req.log = logger;
    next();
  };
};
