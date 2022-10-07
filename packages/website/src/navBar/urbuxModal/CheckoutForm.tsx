import React, { useEffect, useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Box, Button, CircularProgress, Typography, Stack,
} from '@mui/material';
import logger from '../../logger';

function CheckoutForm(): React.ReactElement {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (stripe == null) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret',
    );

    if (clientSecret == null) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    }).catch((error) => {
      // main-178: display error as a snackbar
      logger.error(error);
    });
  }, [stripe]);

  const handleSubmit = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();

    if ((stripe == null) || (elements == null)) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.origin,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message);
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <Box
      component="form"
      id="payment-form"
    >
      <Stack>
        <PaymentElement id="payment-element" />
        <Button
          type="submit"
          id="submit"
          variant="contained"
          disabled={isLoading || (stripe == null) || (elements == null)}
          sx={{ marginTop: 2, marginBottom: 1 }}
          onClick={(e) => {
            handleSubmit(e).catch((err) => {
            // main-78: display error in snackbar
              logger.error(err);
            });
          }}
        >
          {isLoading ? <CircularProgress /> : 'Pay now'}
        </Button>
        {(message != null)
        && (
        <Typography
          color="text.secondary"
          align="center"
          id="payment-message"
          variant="caption"
        >
          {message}
        </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default CheckoutForm;
