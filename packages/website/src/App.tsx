import React, {
  createRef, useEffect, useMemo, useState,
} from 'react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
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
import { auth } from './firebase/setupFirebase';
import { getUser, UserContext } from './models/user';
import CreatorView from './creatorView';
import ProfileView from './profileView';
import PageTracker from './firebase/PageTracker';
import { API_URL } from './models/util';
import logger from './logger';
import GameList from './gameView/gameList';
import GameInfo from './gameView/gamePlayer/GameInfo';
import GamePlayer from './gameView/gamePlayer/GamePlayer';
import NavBar from './navBar';
import { getDate } from './models/instance';

axios.defaults.baseURL = API_URL;

function average(arr: number[]): number {
  return arr.reduce((a, b) => (a != null ? a + b : b), 0) / arr.filter((n) => n).length;
}

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
  const [offset, setOffset] = useState(0);

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
  const NavBarMemo = useMemo(() => <NavBar />, [user, setUser]);
  const snackbarProviderRef = createRef<SnackbarProvider>();

  const offsets: number[] = new Array(10);
  const latencies: number[] = new Array(10);

  let idx = 0;
  useEffect(() => {
    const syncServer = async (): Promise<void> => {
      const requestTimeMS = Date.now();
      const serverTime = await getDate();
      const responseTimeMS = Date.now();

      const serverTimeMS = new Date(serverTime).getMilliseconds();
      const latency = (requestTimeMS - responseTimeMS) / 2;
      latencies[idx] = latency;
      offsets[idx] = serverTimeMS - average(latencies) - requestTimeMS;
      idx = (idx + 1) % 10;

      setOffset(average(offsets));
    };
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async () => syncServer(), 1000);

    return () => clearInterval(interval);
  }, []);

  console.log('OFFSET: ', offset);

  return (
    <ThemeProvider theme={Theme}>
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
                  path="games/*"
                >
                  <Route
                    path=""
                    element={(
                      <>
                        {NavBarMemo}
                        <GameList />
                      </>
                      )}
                  />
                  <Route
                    path=":gameId"
                    element={(
                      <>
                        {NavBarMemo}
                        <GameInfo />
                      </>
                    )}
                  />
                  <Route
                    path=":gameId/room/:roomId"
                    element={<GamePlayer />}
                  />
                </Route>
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
