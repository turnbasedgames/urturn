const setupApp = require('src/loaders/app');
const setupWSS = require('src/loaders/ws');
const defaultLogger = require('src/logger');

function setup(port, logger = defaultLogger) {
  const { app, server } = setupApp(port, logger);
  const wss = setupWSS(server, logger);
  return { wss, app };
}

module.exports = setup;
