import { loadStripe } from '@stripe/stripe-js';

if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY == null) {
  throw new Error('REACT_APP_STRIPE_PUBLISHABLE_KEY env variable not set! This is needed to integrate with stripe.');
}

export default loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
