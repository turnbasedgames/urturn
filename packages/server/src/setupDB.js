const mongoose = require('mongoose');

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

function setupDB() {
  return mongoose.connect(process.env.MONGODB_CONNECTION_URL, options);
}

module.exports = setupDB;
