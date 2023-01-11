import React from 'react';
import {
  Stack,
} from '@mui/material';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BrowserView from '../BrowserView/BrowserView';

function StepTwoIterate() {
  return (
    <Stack direction="row" m={2} spacing={1} alignItems="center">
      <BrowserView url="localhost:3101/player/id_0" sx={{ maxWidth: '400px' }}>
        <img
          src={useBaseUrl('/img/chess-example/player-0.png')}
          alt="gif of first player in chess"
        />
      </BrowserView>
      <BrowserView url="localhost:3101/player/id_1" sx={{ maxWidth: '400px' }}>
        <img
          src={useBaseUrl('/img/chess-example/player-1.png')}
          alt="gif of second player in chess"
        />
      </BrowserView>
    </Stack>
  );
}

export default StepTwoIterate;
