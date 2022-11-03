import React from 'react';
import { Stack } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Theme } from '@urturn/ui-common';
import GameManager from './gameManager';
import Player from './player';

function App() {
  return (
    <ThemeProvider theme={Theme}>
      <Stack
        height="100vh"
      >
        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={(<GameManager />)}
            />
            <Route path="/player/:playerId" element={<Player />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
