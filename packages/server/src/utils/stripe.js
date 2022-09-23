const stripe = require('stripe');

const { STRIPE_KEY } = process.env;
const stripeClient = stripe(STRIPE_KEY);

module.exports = {
  stripeClient,
};
