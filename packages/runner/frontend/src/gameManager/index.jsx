import React from 'react';
import {
  AppBar, Toolbar, Typography, Stack, Button, IconButton, Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import ReactJson from 'react-json-view';

function GameManager() {
  const theme = useTheme();
  const curGameState = {
    msg: 'TODO: MAIN-66 this is the current game state',
  };
  const curPlayers = ['UserId1']; // TODO: MAIN-66 need to get this dynamically
  let playerTitle = 'No Players!';
  if (curPlayers.length === 1) {
    playerTitle = '1 Player';
  } else if (curPlayers.length > 1) {
    playerTitle = `${curPlayers.length} Players`;
  }
  return (
    <Stack height="50%">
      <AppBar position="relative">
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.primary">
            Current Game State
          </Typography>
          <Stack spacing={1} direction="row">
            <Button size="small" variant="outlined">Add Player</Button>
            <Button size="small" variant="outlined" color="error">Restart Game</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Stack
            sx={{ flexGrow: 1 }}
            direction="row"
            spacing={1}
            margin={1}
          >
            <Paper sx={{ flexGrow: 1 }}>
              <ReactJson
                style={{ margin: theme.spacing(1) }}
                name={false}
                theme="twilight"
                src={curGameState}
              />
            </Paper>
            <Paper>
              <Stack margin={1}>
                <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
                    {playerTitle}
                  </Typography>
                </Stack>
                {curPlayers.map((player) => (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.primary">{player}</Typography>
                    <IconButton size="small" color="error"><ClearIcon /></IconButton>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default GameManager;
