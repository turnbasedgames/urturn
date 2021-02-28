const mongoose = require('mongoose');

const options = {
  autoCreate: true,
  autoIndex: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

function setupDB() {
  return mongoose.connect(process.env.MONGODB_CONNECTION_URL, options);
}

module.exports = setupDB;
