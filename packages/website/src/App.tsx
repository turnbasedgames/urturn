import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';

import { Stack } from '@mui/material';
import theme from './theme';
import NavBar from './navBar';
import GameView from './gameView';
import { getUser, User, UserContext } from './models/user';
import CreatorView from './creatorView';
import ProfileView from './profileView';
import API_URL from './models/util';

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG as string;
firebase.initializeApp(JSON.parse(Buffer.from(firebaseConfig, 'base64').toString('ascii')));

axios.defaults.baseURL = API_URL;

function App() {
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
        try {
          const currentUser = await getUser(firebaseUser, true);
          setUser(currentUser);
        } catch (err) {
          // TODO: snackbar error with link to our discord?
        }
      }
    });

    return () => { axios.interceptors.request.eject(authInterceptor); };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        height="100vh"
        overflow="auto"
        direction="column"
      >
        <UserContext.Provider value={{ user, setUser }}>
          <Router>
            <NavBar />
            <Switch>
              <Route exact path="/">
                <Redirect to="/games" />
              </Route>
              <Route path="/games">
                <GameView />
              </Route>
              <Route path="/develop">
                <CreatorView />
              </Route>
              <Route path="/profile">
                <ProfileView />
              </Route>
            </Switch>
          </Router>
        </UserContext.Provider>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
