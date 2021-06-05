const redis = require('redis');

const Publisher = require('./util/publisher');
const Subscriber = require('./util/subscriber');

const client = redis.createClient({
  url: process.env.REDIS_CONNECTION_URL,
});

const publisher = new Publisher(client.duplicate());
const subscriber = new Subscriber(client.duplicate());

module.exports = {
  publisher,
  subscriber,
};
