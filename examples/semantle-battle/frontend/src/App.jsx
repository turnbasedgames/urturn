import React, { useState, useEffect } from 'react';
import {
  ThemeProvider, Typography, Stack, Snackbar, Alert, LinearProgress,
} from '@mui/material';

import client, { events } from '@urturn/client';
import theme from './theme';
import { getStatusMsg } from './utils';
import PlayerList from './PlayerList';
import ChooseSecret from './ChooseSecret';
import InGame from './views/InGame';
import EndGame from './views/EndGame';
import Timer from './Timer';

const CHOOSE_SECRET_TIMEOUT_MS = 30000; // 30 seconds
const IN_GAME_TIMEOUT_MS = 300000; // 5 minutes

function App() {
  const [boardGame, setBoardGame] = useState(client.getBoardGame() || {});
  useEffect(() => {
    const onStateChanged = (newBoardGame) => {
      setBoardGame(newBoardGame);
    };
    events.on('stateChanged', onStateChanged);
    return () => {
      events.off('stateChanged', onStateChanged);
    };
  }, []);

  const [curPlr, setCurPlr] = useState();
  useEffect(() => {
    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer();
      setCurPlr(newCurPlr);
    };
    setupCurPlr();
  }, []);

  const [recentErrorMsg, setRecentErrorMsg] = useState(null);

  const {
    state: {
      plrToSecretHash = {},
      plrToGuessToInfo,
      plrToHintRequest,
      plrToRejectHintResponse,
      hintIndex,
      status,
      winner,
      chooseSecretStartTime,
      guessStartTime,
    } = {},
  } = boardGame;

  const { players = [], finished } = boardGame;
  const dataLoading = boardGame == null || curPlr == null;
  const spectator = !players.some(({ id }) => id === curPlr?.id);
  const generalStatus = getStatusMsg({
    status, winner, finished, curPlr, players, plrToSecretHash, spectator,
  });
  const plrToStatus = players.reduce((prev, cur) => {
    if (status === 'preGame' && plrToSecretHash[cur.id] != null) {
      prev.set(cur.id, { message: 'ready' });
    }
    return prev;
  }, new Map());

  return (
    <ThemeProvider theme={theme}>
      <Stack height="100vh" spacing={1} justifyContent="space-around">
        {status !== 'inGame' && (
        <Stack>
          <Typography variant="h3" textAlign="center" color="text.primary">Semantle Battle</Typography>
          <Typography variant="subtitle1" textAlign="center" color="text.primary">A UrTurn Classic</Typography>
        </Stack>
        )}
        <Stack direction="column" sx={{ marginTop: 1, flexGrow: status === 'inGame' && 1 }} alignItems="center">
          <Typography textAlign="center" color="text.primary">{generalStatus}</Typography>
          {status === 'preGame' && !spectator && chooseSecretStartTime != null && (
          <Timer
            startTime={chooseSecretStartTime}
            timeoutBufferMs={500}
            timeoutMs={CHOOSE_SECRET_TIMEOUT_MS}
            onTimeout={() => {
              client.makeMove({ forceEndGame: true }).catch(console.log);
            }}
            prefix={(curPlr?.id in plrToSecretHash) ? 'Opponent has ' : 'You have '}
            suffix=" seconds to set a secret..."
          />
          )}
          {status === 'inGame' && !spectator && (
            <Timer
              startTime={guessStartTime}
              timeoutBufferMs={500}
              timeoutMs={IN_GAME_TIMEOUT_MS}
              onTimeout={() => {
                client.makeMove({ forceEndGame: true }).catch(console.log);
              }}
              prefix=""
              suffix=""
            />
          )}
          {dataLoading ? <LinearProgress />
            : (
              <Stack margin={2} spacing={1} direction="row" justifyContent="center">
                {status === 'preGame' && (spectator || !(curPlr?.id in plrToSecretHash))
                && (
                  <>
                    {!spectator && (
                    <ChooseSecret
                      setRecentErrorMsg={setRecentErrorMsg}
                    />
                    )}
                    <PlayerList players={players} plrToStatus={plrToStatus} />
                  </>
                )}
                {status === 'inGame' && (
                <InGame
                  players={players}
                  curPlr={curPlr}
                  spectator={spectator}
                  plrToSecretHash={plrToSecretHash}
                  plrToGuessToInfo={plrToGuessToInfo}
                  setRecentErrorMsg={setRecentErrorMsg}
                  plrToHintRequest={plrToHintRequest}
                  plrToRejectHintResponse={plrToRejectHintResponse}
                  hintIndex={hintIndex}
                />
                )}
                {status === 'endGame' && (<EndGame plrToSecretHash={plrToSecretHash} />)}
              </Stack>
            )}
        </Stack>
        <Stack direction="row" justifyContent="center">
          <Typography variant="subtitle2" color="text.secondary">
            Made with ❤️ by Kevin, Sarah, Yoofi
          </Typography>
        </Stack>
      </Stack>
      <Snackbar
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={recentErrorMsg !== null}
        onClose={() => { setRecentErrorMsg(null); }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {recentErrorMsg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
