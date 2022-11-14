const stripe = require('stripe');

const { STRIPE_KEY } = process.env;
const STRIPE_WEBHOOK_SECRET = 'test-stripe-webhook-secret';
const testStripeClient = stripe(STRIPE_KEY);

if (!STRIPE_KEY) {
  throw new Error('STRIPE_KEY environment variable not defined. Some integration tests actually hit the Stripe API test endpoint, and cannot define a dummy one!');
}

function createTestWebhookHeader(stripeClient, payload, webhookSecret) {
  const header = stripeClient.webhooks.generateTestHeaderString({
    payload: JSON.stringify(payload),
    secret: webhookSecret,
  });
  return header;
}

module.exports = {
  testStripeClient,
  testStripeWebhookSecret: STRIPE_WEBHOOK_SECRET,
  testStripeKey: STRIPE_KEY,
  createTestWebhookHeader,
};
