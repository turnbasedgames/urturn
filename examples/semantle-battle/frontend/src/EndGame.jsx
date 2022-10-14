import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { getOtherPlayer } from './utils';

function EndGame({ players, plrToSecretHash, curPlr }) {
  const otherPlr = getOtherPlayer(players, curPlr);
  const otherSecret = plrToSecretHash[otherPlr.id];
  return (
    <Typography color="text.primary">
      {`The secret: ${otherSecret}`}
    </Typography>
  );
}

EndGame.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  })).isRequired,
  curPlr: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
  plrToSecretHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default EndGame;
