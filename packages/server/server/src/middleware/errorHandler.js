const { StatusCodes } = require('http-status-codes');

const logger = require('../logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  logger.error(err);
  res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR);
  res.json(err);
};
