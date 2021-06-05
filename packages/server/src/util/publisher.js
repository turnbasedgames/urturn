const { promisify } = require('util');

const logger = require('../logger');

class Publisher {
  constructor(publisher) {
    this.publisher = publisher;
    this.publishRaw = promisify(publisher.publish).bind(publisher);
    publisher.on('error', (err) => {
      logger.error('error in publisher redis client', { err: err.toString() });
    });
  }

  async publish(chan, msg) {
    const numListeners = await this.publishRaw(chan, msg);
    logger.info('published message', {
      chan, msg, numListeners,
    });
    return numListeners;
  }
}

module.exports = Publisher;
