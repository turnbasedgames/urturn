const express = require('express');
const bodyParser = require('body-parser');

function setup(port, logger) {
  const app = express();
  // TODO: splitup middleware
  app.use(bodyParser.urlencoded());
  app.use(bodyParser.json());

  // TODO: create routers
  const server = app.listen(port, () => {
    logger.info(`App listening on ${server.address().port}`);
  });
  return { app, server };
}

module.exports = setup;
