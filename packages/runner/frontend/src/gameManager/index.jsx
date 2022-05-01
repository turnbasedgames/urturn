import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Stack, Button, IconButton, Paper, MenuItem, MenuList, LinearProgress,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ReactJson from 'react-json-view';
import {
  addPlayer, getState, removePlayer,
} from '../data';

function GameManager() {
  const openPlayerTab = (id) => {
    window.open(`/player/${id}`, '_blank').focus();
  };

  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState(null);
  const { players = [] } = gameState || {};
  async function reloadGameState() {
    setLoading(true);
    const state = await getState();
    setGameState(state);
    setLoading(false);
  }
  useEffect(() => {
    reloadGameState();
  }, []);
  let playerTitle = 'No Players!';
  if (players.length === 1) {
    playerTitle = '1 Player';
  } else if (players.length > 1) {
    playerTitle = `${players.length} Players`;
  }
  return (
    <Stack height="100%">
      <AppBar position="relative">
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.primary">
            Current Game State
          </Typography>
          <Stack spacing={1} direction="row">
            <Button
              size="small"
              variant="outlined"
              onClick={async () => {
                const { id } = await addPlayer();
                await reloadGameState();
                openPlayerTab(id);
              }}
            >
              Add Player
            </Button>
            {/* <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={async () => {
                await resetState();
                await reloadGameState();
              }}
            >
              Restart Game
            </Button> */}
          </Stack>
        </Toolbar>
        {loading && <LinearProgress position="relative" />}
      </AppBar>
      <Stack direction="row" spacing={1} sx={{ minHeight: 0, flexGrow: 1 }}>
        <Stack
          sx={{ padding: 1, flexGrow: 1, minWidth: 0 }}
          direction="row"
          spacing={1}
        >
          <Paper sx={{
            padding: 1,
            flexGrow: 1,
            overflow: 'auto',
          }}
          >
            <ReactJson
              name={false}
              theme="twilight"
              src={gameState}
            />
          </Paper>
          <Paper sx={{
            padding: 1,
            minWidth: '120px',
            overflow: 'auto',
          }}
          >
            <Stack>
              <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
                  {playerTitle}
                </Typography>
              </Stack>
              <MenuList
                id="basic-menu"
                open
                variant="selectedMenu"
              >
                {players.map((player) => (
                  <MenuItem onClick={() => {
                    openPlayerTab(player);
                  }}
                  >
                    <Typography
                      color="text.primary"
                    >
                      {player}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await removePlayer(player);
                        await reloadGameState();
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </MenuItem>
                ))}
              </MenuList>
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default GameManager;
