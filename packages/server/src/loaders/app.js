const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');

const { errorHandler } = require('src/api/middleware');
const { user } = require('src/api/routes');

function setup(port, logger) {
  const app = express();

  // TODO: splitup middleware
  // TODO: setup api logger
  // TODO: setup celebrate for request verification
  // TODO: setup authentication for users (JWT Authentication server)
  // TODO: setup staging branch
  // TODO: setup various ci checks (linting, code coverage, and deployment strategy)
  // TODO: app assumes user will only login with one device, track devices
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Hook up routes
  app.use(user.PATH, user.router);

  app.use(errorHandler);

  const server = app.listen(port, () => {
    logger.info(`App listening on ${server.address().port}`);
  });
  return { app, server };
}

module.exports = setup;
