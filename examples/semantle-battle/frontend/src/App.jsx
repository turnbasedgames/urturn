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
const FORCE_BOT_TIMEOUT_MS = 10000; // 10 seconds if no other player

function App() {
  const [roomState, setRoomState] = useState(client.getRoomState() || {});
  useEffect(() => {
    const onStateChanged = (newRoomState) => {
      setRoomState(newRoomState);
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
      botEnabled,
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
    roomStartContext,
    players = [], finished,
  } = roomState;

  const actualPlayers = [...players];
  if (botEnabled) {
    actualPlayers.push({
      id: 'botId',
      username: 'word_bot',
    });
  }

  const dataLoading = roomState == null || curPlr == null;
  const spectator = !actualPlayers.some(({ id }) => id === curPlr?.id);
  const generalStatus = getStatusMsg({
    status,
    winner,
    finished,
    curPlr,
    players: actualPlayers,
    plrToSecretHash,
    spectator,
    roomStartContext,
  });
  const plrToStatus = actualPlayers.reduce((prev, cur) => {
    if (status === 'preGame' && plrToSecretHash[cur.id] != null) {
      prev.set(cur.id, { message: 'ready' });
    }
    return prev;
  }, new Map());

  const curPlrSecretProvided = plrToSecretHash != null && (curPlr?.id in plrToSecretHash);

  const botEligible = !spectator && actualPlayers.length === 1 && roomStartContext?.private === false && status === 'preGame' && curPlrSecretProvided;
  useEffect(() => {
    if (botEligible) {
      const timeoutId = setTimeout(() => {
        client.makeMove({ forceStart: true }).catch(console.log);
      }, FORCE_BOT_TIMEOUT_MS);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    return () => {};
  }, [botEligible]);

  useEffect(() => {
    if (botEnabled && status === 'inGame') {
      const intervalId = setInterval(() => {
        const shouldBotGuess = Math.random() < 0.3;
        if (shouldBotGuess) {
          client.makeMove({ forceBotMove: true });
        }
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
    return null;
  }, [botEnabled, status]);

  return (
    <ThemeProvider theme={theme}>
      <Stack height="100%" spacing={1} justifyContent="flex-start">
        {status !== 'inGame' && (
        <Stack margin={5}>
          <Typography variant="h3" textAlign="center" color="text.primary">Semantle Battle</Typography>
          <Typography variant="subtitle1" textAlign="center" color="text.primary">A UrTurn Classic</Typography>
        </Stack>
        )}
        <Stack direction="column" sx={{ marginTop: 1, flexGrow: 1 }} alignItems="center">
          <Typography textAlign="center" color="text.primary">{generalStatus}</Typography>
          {status === 'preGame' && !spectator && chooseSecretStartTime != null && (
          <Timer
            startTime={chooseSecretStartTime}
            timeoutBufferMs={2000}
            timeoutMs={CHOOSE_SECRET_TIMEOUT_MS}
            onTimeout={() => {
              client.makeMove({ forceEndGame: true }).catch(console.log);
            }}
            prefix={curPlrSecretProvided ? 'Opponent has ' : 'You have '}
            suffix=" seconds to set a secret..."
          />
          )}
          {status === 'inGame' && !spectator && (
            <Timer
              startTime={guessStartTime}
              timeoutBufferMs={2000}
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
                    <PlayerList players={actualPlayers} plrToStatus={plrToStatus} />
                  </>
                )}
                {status === 'inGame' && (
                <InGame
                  players={actualPlayers}
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
                {status === 'endGame' && (
                <EndGame
                  winner={winner}
                  players={actualPlayers}
                  plrToSecretHash={plrToSecretHash}
                  plrToGuessToInfo={plrToGuessToInfo}
                />
                )}
              </Stack>
            )}
        </Stack>
        <Stack
          sx={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
          }}
          direction="row"
          justifyContent="center"
        >
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
