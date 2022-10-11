import React, { useState, useEffect } from 'react';
import {
  Stack, Paper, TextField, Button, CircularProgress,
} from '@mui/material';
import client from '@urturn/client';
import PropTypes from 'prop-types';
import { getErrorMessageForWord } from './utils';

function ChooseSecret({ setRecentErrorMsg }) {
  const [secret, setSecret] = useState();
  const [secretError, setSecretError] = useState();
  useEffect(() => {
    const errorMessage = getErrorMessageForWord(secret);
    setSecretError(errorMessage);
  }, [secret]);

  const [loading, setLoading] = useState(false);
  return (
    <Paper>
      <Stack padding={1} sx={{ minWidth: '100px' }}>
        <TextField
          disabled={loading}
          error={secret != null && secretError != null}
          helperText={secret != null && secretError}
          margin="dense"
          label="Your Secret"
          variant="outlined"
          value={secret}
          onChange={(event) => { setSecret(event.target.value); }}
        />
        <Button
          variant="contained"
          sx={{ marginTop: 1 }}
          onClick={() => {
            setLoading(true);
            client.makeMove({ secret }).then((res) => {
              const { error } = res;
              if (error) {
                setLoading(false);
                setRecentErrorMsg(error.message);
              }
              // if the move was successful, then asynchronously the view will be updated in App.jsx
              // and modifying the loading state is not important. It should show the loading symbol
              // indefinitely until then
            }).catch((err) => {
              setLoading(false);
              setRecentErrorMsg('Unknown Error occured when submitting secret. Contact Developers.');
              console.error('Unknown error from making move:', err);
            });
          }}
        >
          {loading ? <CircularProgress /> : 'Submit Word'}
        </Button>
      </Stack>
    </Paper>
  );
}

ChooseSecret.propTypes = {
  setRecentErrorMsg: PropTypes.func,
};

ChooseSecret.defaultProps = {
  setRecentErrorMsg: () => {},
};

export default ChooseSecret;
