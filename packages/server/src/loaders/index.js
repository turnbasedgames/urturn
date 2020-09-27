const setupWSS = require('src/loaders/ws');
const defaultLogger = require('src/logger');

function setup(port, logger = defaultLogger) {
  const wss = setupWSS(port, logger);

  return { wss };
}

module.exports = setup;
