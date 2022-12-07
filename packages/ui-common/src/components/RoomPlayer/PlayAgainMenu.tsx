import React, { useState } from 'react';
import {
  Paper, Stack, Typography, Button,
  CircularProgress,
} from '@mui/material';
import { RoomStartContext } from '@urturn/types-common';
import logger from '../../logger';

interface PlayAgainMenuProps {
  spectating: boolean
  roomStartContext: RoomStartContext
  playAgain: () => Promise<void>
}

function PlayAgainMenu({
  spectating,
  roomStartContext, playAgain,
}: PlayAgainMenuProps): React.ReactElement {
  const [loadingRoom, setLoadingRoom] = useState(false);
  const buttonMessage = roomStartContext.private ? 'Restart Private Room' : 'Play Again';
  const disabled = loadingRoom || (roomStartContext.private && spectating);

  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'absolute',
        padding: 0.5,
        paddingLeft: 1,
        paddingRight: 1,
        left: '50%',
        transform: 'translate(-50%)',
        bottom: 0,
      }}
    >
      <Stack sx={{ opacity: 1 }} direction="column">
        <Typography color="text.secondary" variant="subtitle2" align="center">
          Game Finished
        </Typography>
        <Button
          variant={roomStartContext.private ? 'outlined' : 'contained'}
          disabled={disabled}
          onClick={(ev) => {
            ev.preventDefault();
            setLoadingRoom(true);
            playAgain().catch((error) => {
              logger.error(error);
            }).finally(() => {
              setLoadingRoom(false);
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
