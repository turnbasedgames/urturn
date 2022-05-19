const { LoggingWinston } = require('@google-cloud/logging-winston');
const { createLogger, format, transports } = require('winston');

const loggingWinston = new LoggingWinston();

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

const loggerTransports = [];

if (process.env.NODE_ENV === 'production') {
  loggerTransports.push(loggingWinston);
} else {
  loggerTransports.push(new transports.Console(consoleOptions));
}

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  transports: loggerTransports,
});

module.exports = logger;
