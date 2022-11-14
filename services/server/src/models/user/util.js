const {
  uniqueNamesGenerator,
  adjectives,
  animals,
} = require('unique-names-generator');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const User = require('./user');
const { UsernameGenerationError } = require('./errors');
const CurrencyToUrbuxTransaction = require('../transaction/currencyToUrbuxTransaction');

const NAMES_GENERATOR_CONFIG = {
  dictionaries: [adjectives, animals],
  separator: '_',
  length: 2,
};
if (process.env.NAMES_GENERATOR_DICTIONARY) {
  NAMES_GENERATOR_CONFIG.dictionaries = [process.env.NAMES_GENERATOR_DICTIONARY.split(',')];
  NAMES_GENERATOR_CONFIG.length = 1;
}

let NAMES_MAX_ITERATION = 10;
if (process.env.NAMES_GENERATOR_MAX_ITERATIONS) {
  NAMES_MAX_ITERATION = parseInt(process.env.NAMES_GENERATOR_MAX_ITERATIONS, 10);
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateRandomUniqueUsername = async (uid, count = 0, proposedUsernames = [], suffix = '') => {
  if (count > NAMES_MAX_ITERATION) {
    throw new UsernameGenerationError(uid, proposedUsernames);
  }

  const proposedUsername = uniqueNamesGenerator(NAMES_GENERATOR_CONFIG) + (count === 0 ? '' : `_${suffix}`);
  const existingUser = await User.findOne({ username: proposedUsername });
  if (existingUser) {
    return generateRandomUniqueUsername(
      uid,
      count + 1,
      [...proposedUsernames, proposedUsername],
      suffix + randomIntFromInterval(0, 9),
    );
  }
  return proposedUsername;
};

const handlePaymentTransaction = (
  logger, userId, urbuxAmount, paymentAmount, succeededPaymentIntent,
) => mongoose.connection.transaction(async (session) => {
  // we have to make a ghost edit to avoid possible stale reads
  // https://www.mongodb.com/docs/manual/core/transactions-production-consideration/#in-progress-transactions-and-stale-reads
  const currencyToUrbuxTransaction = await CurrencyToUrbuxTransaction.findOneAndUpdate({
    paymentIntentId: succeededPaymentIntent.id,
  }, {
    paymentIntentId: succeededPaymentIntent.id,
  }).session(session).exec();
  if (currencyToUrbuxTransaction) {
    logger.info('duplicate transaction found', { succeededPaymentIntent });
    // If the transaction document already exist with the same paymentIntentId, then we have
    // already processed it and given the user their urbux. Because Stripe retries a webhook
    // indefinitely when there are failures, we will respond with a 200 status code so it does
    // not attempt to retry again. This makes this endpoint operation idempotent.
    return;
  }

  const user = await User.findById(userId).session(session);
  if (user == null) {
    const err = new Error(`Could not find user with provided userId (userId=${userId})`);
    err.status = StatusCodes.NOT_FOUND;
    throw err;
  }

  user.urbux += urbuxAmount;
  await user.save({ session });

  const newCurrencyToUrbuxTransaction = new CurrencyToUrbuxTransaction({
    paymentIntentId: succeededPaymentIntent.id,
    user: userId,
    urbux: paymentAmount,
    paymentIntent: succeededPaymentIntent,
  });

  await newCurrencyToUrbuxTransaction.save({ session });
});

module.exports = { generateRandomUniqueUsername, handlePaymentTransaction };
