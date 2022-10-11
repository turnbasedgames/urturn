import React, { useEffect, useState } from 'react';
import { Stack, Typography, Toolbar } from '@mui/material';
import PropTypes from 'prop-types';
import SubmitWord from './SubmitWord';
import GuessesTable from './GuessesTable';
import {
  getGuessesData, getOtherPlayer,
} from './utils';

function InGame({
  players, curPlr, setRecentErrorMsg, plrToSecretHash, plrToGuesses,
}) {
  const guesses = plrToGuesses[curPlr.id];
  const secret = plrToSecretHash[curPlr.id];
  const [guessesData, setGuessesData] = useState([]);

  const otherPlr = getOtherPlayer(players, curPlr);
  const otherSecret = plrToSecretHash[otherPlr.id];
  const otherGuesses = plrToGuesses[otherPlr.id];
  const [otherGuessesData, setOtherGuessesData] = useState([]);

  useEffect(() => {
    getGuessesData(guesses, otherSecret).then(setGuessesData).catch(console.error);
  }, [guesses]);

  useEffect(() => {
    getGuessesData(otherGuesses, secret).then(setOtherGuessesData).catch(console.error);
  }, [otherGuesses]);

  return (
    <Stack direction="row" spacing={2}>
      <Stack direction="column" sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <Toolbar>
          <Typography color="text.primary">
            {`${otherPlr.username} Guesses`}
          </Typography>
        </Toolbar>
        <GuessesTable
          dense
          guessesData={otherGuessesData}
        />
      </Stack>
      <Stack>
        <SubmitWord
          setRecentErrorMsg={setRecentErrorMsg}
          createMoveFn={((word) => ({ guess: word }))}
          submitText="guess"
          textFieldDefault="guess"
          dense
        />
        <GuessesTable guessesData={guessesData} />
      </Stack>
    </Stack>
  );
}

InGame.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  })).isRequired,
  setRecentErrorMsg: PropTypes.func.isRequired,
  curPlr: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
  plrToSecretHash: PropTypes.objectOf(PropTypes.string).isRequired,
  plrToGuesses: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default InGame;
