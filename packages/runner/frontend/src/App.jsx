import React from 'react';
import { Stack } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import GameManager from './gameManager';
import Timeline from './timeline';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Stack
        height="100vh"
        overflow="auto"
      >
        <GameManager />
        <Timeline />
      </Stack>
    </ThemeProvider>
  );
}

export default App;
