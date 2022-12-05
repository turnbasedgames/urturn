import React, { useState } from 'react';
import {
  Paper, Stack, Typography, Button,
  CircularProgress,
} from '@mui/material';
import { RoomStartContext } from '@urturn/types-common';
import logger from '../../logger';

interface PlayAgainMenuProps {
  roomStartContext: RoomStartContext
  playAgain: () => Promise<void>
}

function PlayAgainMenu({ roomStartContext, playAgain }: PlayAgainMenuProps): React.ReactElement {
  const [loadingRoom, setLoadingRoom] = useState(false);
  const buttonMessage = roomStartContext.private ? 'Restart Private Room' : 'Play Again';

  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'absolute',
        padding: 0.5,
        left: '50%',
        transform: 'translate(-50%)',
        bottom: 0,
      }}
      square
    >
      <Stack sx={{ opacity: 1 }} direction="column">
        <Typography variant="subtitle2" align="center">
          Game Finished!
        </Typography>
        <Button
          size="small"
          fullWidth
          variant={roomStartContext.private ? 'outlined' : 'contained'}
          disabled={loadingRoom}
          onClick={(ev) => {
            ev.preventDefault();
            setLoadingRoom(true);
            playAgain().catch((error) => {
              setLoadingRoom(false);
              logger.error(error);
            });
          }}
        >
          {loadingRoom ? <CircularProgress size={24} /> : buttonMessage}
        </Button>
      </Stack>
    </Paper>
  );
}

export default PlayAgainMenu;
