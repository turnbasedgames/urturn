const { createLogger, format, transports } = require('winston');

const consoleOptions = {
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    format.printf(/* istanbul ignore next */
      ({
        level, message, timestamp, metadata,
      }) => {
        const isEmptyObj = JSON.stringify(metadata, null, 2) === '{}';
        const metadataStr = isEmptyObj ? '' : `\n${JSON.stringify(metadata, null, 2)}`;
        return `${timestamp.replace('T', ' ')} ${level}: ${message}${metadataStr}`;
      },
    ),
  ),
};

// TODO: add logger support for metadata
const logger = createLogger({
  level: process.env.LOG_LEVEL,
  transports: [ // TODO: need production logger support
    new transports.Console(consoleOptions),
  ],
});

module.exports = logger;
