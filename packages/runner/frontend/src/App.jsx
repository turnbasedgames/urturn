import React, { useState } from 'react';
import { Stack } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import GameManager from './gameManager';
import Timeline from './timeline';

function App() {
  const [actionHistory, setActionHistory] = useState([]);
  const addActionToHistory = (action) => {
    setActionHistory([...actionHistory, action]);
  };
  const [gameStateHistory, setGameStateHistory] = useState([]);
  const addStateToGameStateHistory = (state) => {
    if (gameStateHistory.length === 0) {
      addActionToHistory({ name: 'initialize game' });
    }
    setActionHistory([...gameStateHistory, state]);
  };
  const resetGame = () => {
    setActionHistory([]);
    setGameStateHistory([]);
  };
  return (
    <ThemeProvider theme={theme}>
      <Stack
        height="100vh"
        overflow="auto"
      >
        <GameManager
          addActionToHistory={addActionToHistory}
          addStateToGameStateHistory={addStateToGameStateHistory}
          resetGame={resetGame}
        />
        <Timeline />
      </Stack>
    </ThemeProvider>
  );
}

export default App;
