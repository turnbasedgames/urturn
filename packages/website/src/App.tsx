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
import CreateView from './createView';
import { getUser, User, UserContext } from './models/user';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

type Props = {
  classes: any
};

function App({ classes }: Props) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const authInterceptor = axios.interceptors.request.use(async (config) => {
      const newConfig = config;
      const firebaseUser = firebase.auth().currentUser;
      if (firebaseUser) {
        if (!newConfig.headers) {
          newConfig.headers = {};
        }
        newConfig.headers.authorization = await firebaseUser.getIdToken();
      }
      return newConfig;
    });

    firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        firebase.auth().signInAnonymously();
      } else {
        const currentUser = await getUser(firebaseUser, true);
        setUser(currentUser);
      }
    });

    return () => { axios.interceptors.request.eject(authInterceptor); };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{ user, setUser }}>
        <div className={classes.root}>
          <Router>
            <NavBar setUser={setUser} />
            <Toolbar />
            <Switch>
              <Route exact path="/">
                <Redirect to="/games" />
              </Route>
              <Route path="/games">
                <GameView />
              </Route>
              <Route path="/create">
                <CreateView />
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
