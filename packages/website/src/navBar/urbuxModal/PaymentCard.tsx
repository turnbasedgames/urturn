import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CircularProgress } from '@mui/material';
import { createPaymentIntent } from '../../models/user';
import logger from '../../logger';
import CheckoutForm from './CheckoutForm';

const URBUX_1000_COST_USD_CENTS = 1000;

if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY == null) {
  throw new Error('REACT_APP_STRIPE_PUBLISHABLE_KEY env variable not set! This is needed to integrate with stripe.');
}
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
function PaymentCard(): React.ReactElement {
  const [clientSecret, setClientSecret] = useState<string>();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    createPaymentIntent(URBUX_1000_COST_USD_CENTS).then(setClientSecret).catch((err) => {
      // main-178: display error messages when this fails
      logger.error(err);
    });
  }, []);

  return clientSecret == null
    ? <CircularProgress />
    : (
      <Elements
        options={{
          clientSecret,
          appearance: { theme: 'night' },
        }}
        stripe={stripePromise}
      >
        <CheckoutForm />
      </Elements>
    );
}

export default PaymentCard;
