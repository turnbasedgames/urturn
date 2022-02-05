const {
  uniqueNamesGenerator,
  adjectives,
  animals,
} = require('unique-names-generator');

const User = require('./user');
const { UsernameGenerationError } = require('./errors');

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

module.exports = { generateRandomUniqueUsername };
