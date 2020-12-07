import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

import theme from './theme';
import NavBar from './navBar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <NavBar />
      </div>
    </ThemeProvider>
  );
}

export default App;
