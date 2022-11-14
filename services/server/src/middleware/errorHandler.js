const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  req.log.error(`${err.message} ${err.stack}`);
  if (err.status) {
    res.status(err.status);
  } else if (err instanceof mongoose.Error.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST);
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  if (err.toJSON) {
    req.log.error('error JSON:', err.toJSON());
    res.json(err.toJSON());
  } else {
    const { message = 'Error: unknown message' } = err;
    res.json({ message });
  }
};
