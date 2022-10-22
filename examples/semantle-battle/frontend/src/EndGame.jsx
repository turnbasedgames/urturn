import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Stack } from '@mui/material';

function EndGame({ plrToSecretHash, curPlr }) {
  const otherSecrets = Object.entries(plrToSecretHash)
    .map(([plrId, secret]) => (curPlr.id !== plrId ? secret : undefined))
    .filter((secret) => secret != null);
  return (
    <Stack>
      <Typography variants="h5" color="text.primary">we keep secrets from each other but they somehow find a way to be revealed...</Typography>
      {otherSecrets.map((secret) => (
        <Typography color="secondary">
          {secret}
        </Typography>
      ))}
    </Stack>
  );
}

EndGame.propTypes = {
  curPlr: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
  plrToSecretHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default EndGame;
