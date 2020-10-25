const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('./absolutePath');
const setupLoaders = require('src/loaders');

class TestApp {
  async setup() {
    const mongod = new MongoMemoryServer();
    const mongoUri = await mongod.getUri();

    // disconnect in case cleanup was not properly called
    await mongoose.disconnect();

    this.mongod = mongod;
    this.loaders = await setupLoaders(0, undefined, mongoUri);
  }

  async cleanup() {
    this.loaders.wss.close();
    await mongoose.disconnect();
    await this.mongod.stop();
  }
}

module.exports = TestApp;
