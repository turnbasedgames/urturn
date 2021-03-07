import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
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

import axios from 'axios';
import theme from './theme';
import NavBar from './navBar';
import GameView from './gameView';
import { getUser, User, UserContext } from './user';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

type Props = {
  classes: any
};

function App({ classes }: Props) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        firebase.auth().signInAnonymously();
      } else {
        // this is getting triggered by login button
        console.log(`reset: attempt to get user ${JSON.stringify(user, null, 2)}`);
        const currentUser = await getUser(firebaseUser, true);
        setUser(currentUser);
      }
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{ user, setUser }}>
        <div className={classes.root}>
          <Router>
            <NavBar />
            <Toolbar />
            <Switch>
              <Route exact path="/">
                <Redirect to="/games" />
              </Route>
              <Route path="/games">
                {/* <GameView /> */}
              </Route>
              <Route path="/about">
                <div>
                  Hello this is about the Platform
                </div>
              </Route>
            </Switch>
          </Router>
        </div>
      </UserContext.Provider>
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
