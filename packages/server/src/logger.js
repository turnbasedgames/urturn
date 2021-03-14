const { createLogger, format, transports } = require('winston');

const consoleOptions = {
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(/* istanbul ignore next */
      ({
        level, message, timestamp,
      }) => `${timestamp.replace('T', ' ')} ${level}: ${message}`,
    ),
  ),
};

// TODO: add logger support for metadata
const logger = createLogger({
  level: process.env.LOG_LEVEL,
  defaultMeta: { service: 'backend' },
  transports: [ // TODO: need production logger support
    new transports.Console(consoleOptions),
  ],
});

module.exports = logger;
