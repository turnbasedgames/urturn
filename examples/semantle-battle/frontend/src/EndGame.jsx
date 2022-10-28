import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Stack } from '@mui/material';
import { Buffer } from 'buffer';

function EndGame({ plrToSecretHash, curPlr }) {
  const otherSecrets = Object.entries(plrToSecretHash)
    .map(([plrId, secretHash]) => (curPlr.id !== plrId ? secretHash : undefined))
    .filter((secretHash) => secretHash != null);
  return (
    <Stack>
      <Typography variants="h5" color="text.primary">we keep secrets from each other but they somehow find a way to be revealed...</Typography>
      {otherSecrets.map((secretHash) => (
        <Typography color="secondary">
          {Buffer.from(secretHash, 'base64').toString('ascii')}
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
