import React, { useState, useEffect } from 'react';
import {
  ThemeProvider, Typography, Stack, Box, List, ListItem, ListItemText, Paper, Snackbar, Alert, Fade,
  Button,
} from '@mui/material';

import client, { events } from '@urturn/client';
import theme from './theme';

// prevent rerendering tictactoe row and entries that are the same value
const getRowKey = (row, rowNum) => `${rowNum}-${row.join('-')}`;
const getColKey = (val, colNum) => `${colNum}-${val}`;

const getStatusMsg = ({
  status, winner, finished, plrToMove, curPlr,
}) => {
  if (finished) {
    if (winner == null) {
      return "It's a tie!";
    } if (winner?.id === curPlr?.id) {
      return 'You won!';
    }
    return 'You Lost';
  } if (status === 'preGame') {
    return 'Waiting on for another player to join...';
  } if (status === 'inGame') {
    console.log(plrToMove, curPlr);
    if (plrToMove.id === curPlr?.id) {
      return "It's ur turn; make a move";
    }
    return `Waiting on other player ${plrToMove.username} to make their move...`;
  }
  return 'Error: You should never see this. Contact developers!';
};

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
      board,
      status,
      winner,
      plrToMoveIndex,
    } = {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
    },
  } = boardGame;
  const { players = [], finished } = boardGame;
  const generalStatus = getStatusMsg({
    status, winner, finished, plrToMove: status === 'inGame' ? players[plrToMoveIndex] : null, curPlr,
  });

  return (
    <ThemeProvider theme={theme}>
      <Stack spacing={1} sx={{ justifyContent: 'center' }}>
        <Typography variant="h3" textAlign="center" color="text.primary">TicTacToe</Typography>
        <Typography textAlign="center" color="text.primary">{generalStatus}</Typography>
        <Stack margin={2} spacing={1} direction="row" justifyContent="center">
          <Box>
            {board.map((row, rowNum) => (
              <Stack key={getRowKey(row, rowNum)} direction="row">
                {row.map((val, colNum) => (
                  <Button
                    disabled={val != null}
                    key={getColKey(val, colNum)}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      border: 1,
                      borderColor: 'text.primary',
                      height: '100px',
                      width: '100px',
                    }}
                    onClick={async () => {
                      const move = { x: rowNum, y: colNum };
                      const { error } = await client.makeMove(move);
                      if (error) {
                        setRecentErrorMsg(error.message);
                      }
                    }}
                  >
                    <Typography
                      color="text.primary"
                      fontSize="60px"
                    >
                      {val}
                    </Typography>
                  </Button>
                ))}
              </Stack>
            ))}
          </Box>
          <Paper>
            <Stack padding={1} sx={{ minWidth: '100px' }}>
              <Typography color="text.primary">Players</Typography>
              <List dense disablePadding padding={0}>
                {players.map((player, ind) => (
                  <ListItem dense disablePadding key={player.id}>
                    <ListItemText primary={`${ind + 1}: ${player.username}`} />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Paper>
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
