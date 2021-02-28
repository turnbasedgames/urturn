const morgan = require('morgan');
const logger = require('../logger');

module.exports = morgan(':method :url :status :response-time ms', { stream: { write: (message) => logger.info(message.slice(0, -1)) } });
