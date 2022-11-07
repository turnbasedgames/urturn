import React, { useState, useEffect } from 'react';
import {
  ThemeProvider, Typography, Stack, Box, List, ListItem, ListItemText, Paper, Snackbar, Alert, Fade,
} from '@mui/material';

import client, { events } from '@urturn/client';
import theme from './theme';

// prevent rerendering tictactoe row and entries that are the same value
const getRowKey = (row, rowNum) => `${rowNum}-${row.join('-')}`;
const getColKey = (val, colNum) => `${colNum}-${val}`;

const getStatusMsg = ({
  status, winner, finished, plrToMove,
}) => {
  if (finished) {
    if (winner) {
      return `${winner.username} won the game!`;
    }
    return "It's a tie!";
  } if (status === 'preGame') {
    return 'Waiting on another player...';
  } if (status === 'inGame') {
    return `Waiting on player ${plrToMove.username} to make their move...`;
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
    status, winner, finished, plrToMove: status === 'inGame' ? players[plrToMoveIndex] : null,
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
                  <Stack
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
                    onClick={async (event) => {
                      event.preventDefault();
                      const move = { x: rowNum, y: colNum };
                      const { error } = await client.makeMove(move);
                      if (error) {
                        setRecentErrorMsg(error.message);
                      }
                    }}
                  >
                    <Typography color="text.primary" fontSize="60px">
                      {val}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ))}
          </Box>
          <Paper>
            <Stack padding={1} sx={{ minWidth: '100px' }}>
              <Typography disableGutter color="text.primary">Players</Typography>
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
