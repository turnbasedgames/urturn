const mongoose = require('mongoose');
const logger = require('./logger');

const options = {
  autoCreate: true,
  autoIndex: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// integration tests will set this much lower to speed up tests with db failures
if (process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) {
  options.serverSelectionTimeoutMS = process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS;
}

async function setupDB() {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL, options);
  return async () => {
    logger.warn('closing mongodb connection...');
    await mongoose.disconnect();
    logger.warn('successfully closed mongodb connection');
  };
}

module.exports = setupDB;
