import React from 'react';
import { Stack } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import theme from './theme';
import GameManager from './gameManager';
import Player from './player';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={(
              <Stack
                height="100vh"
              >
                <GameManager />
              </Stack>
          )}
          />
          <Route path="/player/:playerId" element={<Player />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
