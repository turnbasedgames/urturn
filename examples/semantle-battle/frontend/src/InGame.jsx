import React, { useEffect, useState } from 'react';
import { Stack, Typography, Toolbar } from '@mui/material';
import PropTypes from 'prop-types';
import SubmitWord from './SubmitWord';
import GuessesTable from './GuessesTable';
import InGameMenu from './InGameMenu';
import {
  getGuessesData, getOtherPlayer,
} from './utils';

function InGame({
  players, curPlr, setRecentErrorMsg, plrToSecretHash, plrToGuessToInfo, plrToHintRequest,
  plrToRejectHintResponse, hintIndex,
}) {
  const guessToInfo = plrToGuessToInfo[curPlr.id];
  const secret = plrToSecretHash[curPlr.id];
  const [guessesData, setGuessesData] = useState({ sortedGuesses: [] });

  const otherPlr = getOtherPlayer(players, curPlr);
  const otherSecret = plrToSecretHash[otherPlr.id];
  const otherGuessToInfo = plrToGuessToInfo[otherPlr.id];
  const [otherGuessesData, setOtherGuessesData] = useState({ sortedGuesses: [] });

  useEffect(() => {
    getGuessesData(guessToInfo, otherSecret, hintIndex)
      .then(setGuessesData)
      .catch(console.error);
  }, [guessToInfo]);

  useEffect(() => {
    getGuessesData(otherGuessToInfo, secret, hintIndex)
      .then(setOtherGuessesData)
      .catch(console.error);
  }, [otherGuessToInfo]);

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
      <Stack spacing={1}>
        <SubmitWord
          setRecentErrorMsg={setRecentErrorMsg}
          createMoveFn={((word) => ({ guess: word }))}
          submitText="guess"
          textFieldDefault="guess"
          dense
        />
        <InGameMenu
          setRecentErrorMsg={setRecentErrorMsg}
          secret={secret}
          plrToHintRequest={plrToHintRequest}
          plrToRejectHintResponse={plrToRejectHintResponse}
          hintIndex={hintIndex}
          curPlr={curPlr}
          otherPlr={otherPlr}
        />
        <GuessesTable guessesData={guessesData} />
      </Stack>
    </Stack>
  );
}

InGame.propTypes = {
  plrToHintRequest: PropTypes.objectOf(PropTypes.bool).isRequired,
  plrToRejectHintResponse: PropTypes.objectOf(PropTypes.string).isRequired,
  hintIndex: PropTypes.number.isRequired,
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  })).isRequired,
  setRecentErrorMsg: PropTypes.func.isRequired,
  curPlr: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
  plrToSecretHash: PropTypes.objectOf(PropTypes.string).isRequired,
  plrToGuessToInfo: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
    lastUpdateTime: PropTypes.string,
    count: PropTypes.number,
  }))).isRequired,
};

export default InGame;
