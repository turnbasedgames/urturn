import React from 'react';
import {
  ThemeProvider, withStyles,
} from '@material-ui/core/styles';

import theme from './theme';
import NavBar from './navBar';
import GameView from './gameView';

type Props = {
  classes: any
};

function App({ classes }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <NavBar />
        <GameView />
      </div>
    </ThemeProvider>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100vh',
  },
};

export default withStyles(styles)(App);
