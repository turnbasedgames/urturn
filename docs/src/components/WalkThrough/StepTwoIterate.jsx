import React from 'react';
import {
  Stack, Typography, Box,
} from '@mui/material';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BrowserView from '../BrowserView/BrowserView';

function StepTwoIterate() {
  return (
    <Stack
      direction="row"
      m={2}
      spacing={1}
      alignItems="center"
      sx={{ flexWrap: 'wrap', gap: 2 }}
    >
      <Typography variant="body1">
        Simulate your game with the
        <Box color="var(--ifm-color-primary)" fontWeight="bold" component="span"> Runner </Box>
        on localhost
      </Typography>
      <BrowserView url="localhost:3101/player/id_0" sx={{ maxWidth: '300px' }}>
        <img
          src={useBaseUrl('/img/chess-example/player-0.png')}
          alt="gif of first player in chess"
        />
      </BrowserView>
      <BrowserView url="localhost:3101/player/id_1" sx={{ maxWidth: '300px' }}>
        <img
          src={useBaseUrl('/img/chess-example/player-1.png')}
          alt="gif of second player in chess"
        />
      </BrowserView>
      <BrowserView elevation={2} sx={{ maxWidth: '600px', flexGrow: 1 }}>
        <img src={useBaseUrl('/img/runner-room-state.svg')} alt="gif of terminal initializing game" />
      </BrowserView>
    </Stack>
  );
}

export default StepTwoIterate;
