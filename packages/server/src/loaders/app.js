const express = require('express');
const bodyParser = require('body-parser');
const { errorHandler } = require('src/api/middleware');

function setup(port, logger) {
  const app = express();
  // TODO: splitup middleware
  // TODO: get async support with error handling
  // TODO: setup api logger
  // TODO: setup celebrate for request verification
  // TODO: setup authentication for users (JWT Authentication server)
  app.use(bodyParser.urlencoded());
  app.use(bodyParser.json());

  // TODO: create routers

  app.use(errorHandler);

  const server = app.listen(port, () => {
    logger.info(`App listening on ${server.address().port}`);
  });
  return { app, server };
}

module.exports = setup;
