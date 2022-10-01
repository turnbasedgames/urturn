import React from 'react';
import { IconButton, Stack, Paper } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { SiDiscord } from 'react-icons/si';
import { DISCORD_URL } from '../../util';

function PlayerMenu(): React.ReactElement {
  return (
    <Paper>
      <Stack
        sx={{ position: 'absolute', margin: 0.5 }}
      >
        {/* TODO:KEVIN put tool tip that says quit game
            TODO: What other things should we add? */}
        <IconButton href={DISCORD_URL} target="_blank">
          <SiDiscord />
        </IconButton>
        <IconButton
          size="small"
        >
          <ExitToAppIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default PlayerMenu;
