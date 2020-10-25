const setupApp = require('src/loaders/app');
const setupDB = require('src/loaders/mongoose');
const setupWSS = require('src/loaders/ws');
const defaultLogger = require('src/logger');

async function setup(port, logger = defaultLogger, mongoUri) {
  await setupDB(logger, mongoUri);
  const { app, server } = setupApp(port, logger);
  const wss = setupWSS(server, logger);
  return { wss, app };
}

module.exports = setup;
