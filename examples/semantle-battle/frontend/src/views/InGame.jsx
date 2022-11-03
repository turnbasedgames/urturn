import { Buffer } from 'buffer';
import React from 'react';
import { Stack, Typography, Toolbar } from '@mui/material';
import PropTypes from 'prop-types';
import SubmitWord from '../SubmitWord';
import GuessesTable from '../GuessesTable';
import InGameMenu from './InGameMenu';
import {
  getGuessesData, getOtherPlayer,
} from '../utils';

function InGame({
  players, curPlr, setRecentErrorMsg, plrToSecretHash, plrToGuessToInfo, plrToHintRequest,
  plrToRejectHintResponse, hintIndex, spectator,
}) {
  if (spectator) {
    return (
      <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
        {players?.map(({ id, username }) => (
          <Stack key={id} direction="column" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Toolbar>
              <Typography color="text.primary">
                {`${username} Guesses`}
              </Typography>
            </Toolbar>
            <GuessesTable
              dense
              guessesData={getGuessesData(plrToGuessToInfo[id])}
            />
          </Stack>
        ))}
      </Stack>
    );
  }

  const guessToInfo = plrToGuessToInfo[curPlr.id];
  const secret = Buffer.from(plrToSecretHash[curPlr.id], 'base64').toString('ascii');
  const guessesData = getGuessesData(guessToInfo);

  const otherPlr = getOtherPlayer(players, curPlr);
  const otherGuessToInfo = plrToGuessToInfo[otherPlr.id];
  const otherGuessesData = getGuessesData(otherGuessToInfo);

  return (
    <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
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
  spectator: PropTypes.bool.isRequired,
};

export default InGame;
