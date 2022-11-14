const stripe = require('stripe');

const { STRIPE_KEY, STRIPE_WEBHOOK_SECRET } = process.env;
const stripeClient = stripe(STRIPE_KEY);

if (!STRIPE_KEY) {
  throw new Error('STRIPE_KEY environment variable is not defined');
}

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not defined');
}

module.exports = {
  stripeClient,
  webhookSecret: STRIPE_WEBHOOK_SECRET,
};
