const HttpStatus = require('http-status-codes');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  res.json({
    error: {
      message: err.message,
    },
  });
};
