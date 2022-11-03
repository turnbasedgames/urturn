import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Stack } from '@mui/material';
import { Buffer } from 'buffer';

function EndGame({ plrToSecretHash }) {
  const otherSecrets = Object.entries(plrToSecretHash);
  return (
    <Stack>
      {otherSecrets.length > 0
        && (
        <>
          <Typography variants="h5" color="text.primary">we keep secrets from each other but they somehow find a way to be revealed...</Typography>
          {otherSecrets.map(([plrId, secretHash]) => (
            <Typography color="secondary">
              {`${plrId} => ${Buffer.from(secretHash, 'base64').toString('ascii')}`}
            </Typography>
          ))}
        </>
        )}
    </Stack>
  );
}

EndGame.propTypes = {
  plrToSecretHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default EndGame;
