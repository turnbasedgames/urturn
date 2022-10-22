import React, { useState, useEffect } from 'react';
import {
  ThemeProvider, Typography, Stack, Snackbar, Alert, Fade, LinearProgress,
} from '@mui/material';

import client, { events } from '@urturn/client';
import theme from './theme';
import { getStatusMsg, getWordData } from './utils';
import PlayerList from './PlayerList';
import ChooseSecret from './ChooseSecret';
import InGame from './InGame';
import EndGame from './EndGame';

// TODO: add local caching per session
// TODO: cool animated background with words bouncing around
// TODO: add music playlist
function App() {
  // loading in word data
  const [loadingWordData, setLoadingWordData] = useState(true);
  useEffect(() => {
    getWordData().then(() => setLoadingWordData(false)).catch(console.error);
  });

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
      status,
      winner,
    } = {},
  } = boardGame;
  const { players = [], finished } = boardGame;
  const dataLoading = boardGame == null || curPlr == null || loadingWordData;
  const generalStatus = getStatusMsg({
    status, winner, finished, curPlr, players, plrToSecretHash, dataLoading,
  });
  const plrToStatus = players.reduce((prev, cur) => {
    if (status === 'preGame' && plrToSecretHash[cur.id] != null) {
      prev.set(cur.id, { message: 'ready' });
    }
    return prev;
  }, new Map());

  return (
    <ThemeProvider theme={theme}>
      <Stack height="100vh" spacing={1} justifyContent={status === 'inGame' ? 'start' : 'space-around'}>
        {status !== 'inGame' && (
        <Stack>
          <Typography variant="h3" textAlign="center" color="text.primary">Semantle Battle</Typography>
          <Typography variant="subtitle1" textAlign="center" color="text.primary">A UrTurn Classic</Typography>
        </Stack>
        )}
        <Stack direction="column" sx={{ marginTop: 1 }}>
          <Typography textAlign="center" color="text.primary">{generalStatus}</Typography>
          {dataLoading ? <LinearProgress />
            : (
              <Stack margin={2} spacing={1} direction="row" justifyContent="center">
                {status === 'preGame' && !(curPlr?.id in plrToSecretHash)
                && (
                  <>
                    <ChooseSecret
                      setRecentErrorMsg={setRecentErrorMsg}
                    />
                    <PlayerList players={players} plrToStatus={plrToStatus} />
                  </>
                )}
                {status === 'inGame' && (
                <InGame
                  players={players}
                  curPlr={curPlr}
                  plrToSecretHash={plrToSecretHash}
                  plrToGuessToInfo={plrToGuessToInfo}
                  setRecentErrorMsg={setRecentErrorMsg}
                />
                )}
                {status === 'endGame' && (<EndGame curPlr={curPlr} plrToSecretHash={plrToSecretHash} />
                )}
              </Stack>
            )}
        </Stack>
        <Stack direction="row">
          {/* TODO: put about and other links
          1. how to make a game like this (blog link)
          2. about UrTurn
          3. kevin.tang = kevintang.info
          */}
        </Stack>
      </Stack>
      <Snackbar
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={recentErrorMsg !== null}
        onClose={() => { setRecentErrorMsg(null); }}
        TransationComponent={Fade}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {recentErrorMsg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
