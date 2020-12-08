import React from 'react';
import {
  ThemeProvider, withStyles,
} from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Toolbar } from '@material-ui/core';

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
        <Router>
          <NavBar />
          <Toolbar />
          <Switch>
            <Route exact path="/">
              <Redirect to="/games" />
            </Route>
            <Route path="/games">
              <GameView />
            </Route>
            <Route path="/about">
              <div>
                Hello this is about the Platform
              </div>
            </Route>
          </Switch>
        </Router>
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
