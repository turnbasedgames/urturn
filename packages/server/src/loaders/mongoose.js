const mongoose = require('mongoose');

const options = {
  autoCreate: true,
  autoIndex: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function setupDB(logger, mongoUri) {
  await mongoose.connect(mongoUri, options);
  logger.info(`Connected to DB (user: ${mongoose.connection.user}, host: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name})`);
}

module.exports = setupDB;
