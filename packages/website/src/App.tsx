import React, {
  createRef, useEffect, useMemo, useState,
} from 'react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarKey, SnackbarProvider } from 'notistack';
import {
  Stack, Slide, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { User } from '@urturn/types-common';
import { auth } from './firebase/setupFirebase';
import theme from './theme';
import NavBar from './navBar';
import GameView from './gameView';
import { getUser, UserContext } from './models/user';
import CreatorView from './creatorView';
import ProfileView from './profileView';
import PageTracker from './firebase/PageTracker';
import { API_URL } from './models/util';
import logger from './logger';

axios.defaults.baseURL = API_URL;

function CloseSnackBarButton(snackbarProviderRef?: React.RefObject<SnackbarProvider>) {
  return function SnackBarButton(key: SnackbarKey) {
    return (
      <IconButton onClick={() => {
        if (snackbarProviderRef?.current != null) {
          snackbarProviderRef.current.closeSnackbar(key);
        }
      }}
      >
        <CloseIcon />
      </IconButton>
    );
  };
}

function App(): React.ReactElement {
  const [user, setUser] = useState<User | undefined>();
  useEffect(() => {
    const authInterceptor = axios.interceptors.request.use(async (config) => {
      const newConfig = config;
      const firebaseUser = auth.currentUser;
      if (firebaseUser != null) {
        if (newConfig.headers == null) {
          newConfig.headers = {};
        }
        newConfig.headers.authorization = await firebaseUser.getIdToken();
      }
      return newConfig;
    });

    const setupUser = async (firebaseUser: FirebaseUser): Promise<void> => {
      const currentUser = await getUser(firebaseUser, true);
      setUser(currentUser);
    };

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser == null) {
        signInAnonymously(auth).catch(logger.error);
      } else {
        setupUser(firebaseUser).catch(logger.error);
      }
    });

    return () => { axios.interceptors.request.eject(authInterceptor); };
  }, []);
  const userProviderValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  const snackbarProviderRef = createRef<SnackbarProvider>();

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        ref={snackbarProviderRef}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Slide}
        action={CloseSnackBarButton(snackbarProviderRef)}
        maxSnack={3}
      >
        <Stack
          height="100vh"
          overflow="auto"
          direction="column"
        >
          <UserContext.Provider value={userProviderValue}>
            <Router>
              <PageTracker />
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
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
