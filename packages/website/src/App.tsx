import React, {
  createRef, useEffect, useMemo, useState,
} from 'react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { getAnalytics, setUserId } from 'firebase/analytics';
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarKey, SnackbarProvider } from 'notistack';
import {
  Stack, Slide, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Theme } from '@urturn/ui-common';
import { User } from '@urturn/types-common';
import { Helmet } from 'react-helmet';
import { auth } from './firebase/setupFirebase';
import { getUser, UserContext } from './models/user';
import CreatorView from './creatorView';
import ProfileView from './profileView';
import { API_URL } from './models/util';
import logger from './logger';
import GameList from './gameView/gameList';
import GameInfo from './gameView/gamePlayer/GameInfo';
import GamePlayer from './gameView/gamePlayer/GamePlayer';
import NavBar from './navBar';

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

  useEffect(() => {
    if (user != null) {
      const analytics = getAnalytics();
      setUserId(analytics, user.id);
    }
  }, [user]);
  const userProviderValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  const NavBarMemo = useMemo(() => <NavBar />, [user, setUser]);
  const snackbarProviderRef = createRef<SnackbarProvider>();

  return (
    <ThemeProvider theme={Theme}>
      <Helmet>
        <title>UrTurn - multiplayer web games at UrTurn.app</title>
        <meta name="author" content="UrTurn LLC" />
        <meta name="description" content="Play your favorite multiplayer web games for free (online board games, word games, and more)!" />
        <meta name="keywords" content="free games, board games, multiplayer games, creating games, free game hosting, card games, word games, puzzle games" />
      </Helmet>
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
              <Routes>
                <Route
                  path="play/:customURL"
                  element={(
                    <>
                      {NavBarMemo}
                      <GameInfo />
                    </>
                  )}
                />
                <Route
                  path="rooms/:roomId"
                  element={<GamePlayer />}
                />
                <Route
                  path="games/*"
                  element={(
                    <>
                      {NavBarMemo}
                      <GameList />
                    </>
                  )}
                />
                <Route
                  path="develop/*"
                  element={(
                    <>
                      {NavBarMemo}
                      <CreatorView />
                    </>
                  )}
                />
                <Route
                  path="profile/*"
                  element={(
                    <>
                      {NavBarMemo}
                      <ProfileView />
                    </>
                  )}
                />
                <Route path="*" element={<Navigate to="/games" />} />
              </Routes>
            </Router>
          </UserContext.Provider>
        </Stack>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
