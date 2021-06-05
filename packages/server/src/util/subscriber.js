const EventEmitter = require('events');
const { promisify } = require('util');

const logger = require('../logger');

class Subscriber {
  constructor(subscriber) {
    this.subscriber = subscriber;
    this.subscribeRaw = promisify(this.subscriber.subscribe).bind(this.subscriber);
    this.unsubscribeRaw = promisify(this.subscriber.unsubscribe).bind(this.subscriber);
    this.subscriptions = {};
    this.messageEventEmitter = new EventEmitter();

    this.subscriber.on('message', (chan, msg) => {
      logger.info('subscriber received message', { chan, msg });
      this.messageEventEmitter.emit(chan, msg);
    });

    this.subscriber.on('error', (err) => {
      logger.error('error in subscribers redis client', { err: err.toString() });
    });
  }

  async subscribe(chan) {
    await this.subscribeRaw(chan);
    if (chan in this.subscriptions) {
      this.subscriptions[chan] += 1;
    } else {
      this.subscriptions[chan] = 1;
    }
    logger.info('subscribed to channel', { chan, subscriptions: this.subscriptions });
  }

  async unsubscribe(chan) {
    if (chan in this.subscriptions) {
      if (this.subscriptions[chan] === 1) {
        await this.unsubscribeRaw(chan);
        delete this.subscriptions[chan];
        logger.info('unsubscribed to channel', { chan, subscriptions: this.subscriptions });
      } else {
        this.subscriptions[chan] -= 1;
        logger.info('other subscriptions exist, no op', { chan, subscriptions: this.subscriptions });
      }
    } else {
      throw new Error(`Not subscribed to channel: "${chan}"`);
    }
  }

  async onChannelMessage(chan, cb) {
    await this.subscribe(chan);
    this.messageEventEmitter.on(chan, cb);
  }

  async offChannelMessage(chan, cb) {
    await this.unsubscribe(chan);
    this.messageEventEmitter.off(chan, cb);
  }
}

module.exports = Subscriber;
