import React, { useState, useEffect } from 'react';
import {
  ThemeProvider, Typography, Stack, Snackbar, Alert, Fade,
} from '@mui/material';

import client, { events } from '@urturn/client';
import theme from './theme';
import { getStatusMsg } from './utils';
import PlayerList from './PlayerList';
import ChooseSecret from './ChooseSecret';

// TODO: remove debug statements
function App() {
  const [boardGame, setBoardGame] = useState(client.getBoardGame() || {});
  console.log('boardGame:', boardGame);
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
  console.log('new current plr', curPlr);
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
      plrToSecretHash,
      plrToGuesses,
      status,
      winner,
    } = {},
  } = boardGame;
  console.log(plrToSecretHash, plrToGuesses);
  const { players = [], finished } = boardGame;
  const generalStatus = getStatusMsg({
    status, winner, finished, curPlr, players, plrToSecretHash,
  });
  // TODO: cool animated background with words bouncing around
  return (
    <ThemeProvider theme={theme}>
      <Stack height="100vh" spacing={1} justifyContent="space-around">
        <Stack>
          <Typography variant="h3" textAlign="center" color="text.primary">Semantle Battle</Typography>
          <Typography variant="subtitle1" textAlign="center" color="text.primary">A UrTurn Classic</Typography>
        </Stack>
        <Stack direction="column">
          <Typography textAlign="center" color="text.primary">{generalStatus}</Typography>
          <Stack margin={2} spacing={1} direction="row" justifyContent="center">
            {status === 'preGame' && !(curPlr?.id in plrToSecretHash) && <ChooseSecret setRecentErrorMsg={setRecentErrorMsg} />}
            <PlayerList players={players} />
          </Stack>
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
