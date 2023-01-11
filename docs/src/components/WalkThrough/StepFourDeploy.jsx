import React from 'react';
import {
  Stack, Typography, Box,
} from '@mui/material';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BrowserView from '../BrowserView/BrowserView';

function StepFourDeploy() {
  return (
    <Stack height="100%" justifyContent="center" spacing={2}>
      <Typography variant="body1">
        We scale and operate your game logic on our functions as a service platform
        <Box color="var(--ifm-color-primary)" fontWeight="bold" component="span"> for free</Box>
        .
      </Typography>
      <Typography>
        Provide the GitHub Url and commit and your game will be available immediately for anyone
        to play
      </Typography>
      <BrowserView url="https://urturn.app" elevation={2} sx={{ maxWidth: '400px' }}>
        <img src={useBaseUrl('/img/chess-example/deploy-chess.png')} alt="gif of terminal initializing game" />
      </BrowserView>
    </Stack>
  );
}

export default StepFourDeploy;
