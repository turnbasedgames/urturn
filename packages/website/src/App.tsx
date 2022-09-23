import React, { createRef, useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import axios from 'axios'
import { ThemeProvider } from '@mui/material/styles'
import { SnackbarProvider, SnackbarKey } from 'notistack'
import {
  Stack, Slide, IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { auth } from './firebase/setupFirebase'
import theme from './theme'
import NavBar from './navBar'
import GameView from './gameView'
import { getUser, User, UserContext } from './models/user'
import CreatorView from './creatorView'
import ProfileView from './profileView'
import PageTracker from './firebase/PageTracker'
import API_URL from './models/util'

axios.defaults.baseURL = API_URL

const App = (): React.ReactElement => {
  const [user, setUser] = useState<User | undefined>()
  useEffect(() => {
    const authInterceptor = axios.interceptors.request.use(async (config) => {
      const newConfig = config
      const firebaseUser = auth.currentUser
      if (firebaseUser != null) {
        if (newConfig.headers == null) {
          newConfig.headers = {}
        }
        newConfig.headers.authorization = await firebaseUser.getIdToken()
      }
      return newConfig
    })

    const setupUser = async (firebaseUser: FirebaseUser): Promise<void> => {
      const currentUser = await getUser(firebaseUser, true)
      setUser(currentUser)
    }

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser == null) {
        signInAnonymously(auth).catch(console.error)
      } else {
        setupUser(firebaseUser).catch(console.error)
      }
    })

    return () => { axios.interceptors.request.eject(authInterceptor) }
  }, [])

  const snackbarProviderRef = createRef<SnackbarProvider>()
  const onClickDismiss = (key: SnackbarKey) => () => {
    if (snackbarProviderRef.current != null) {
      snackbarProviderRef.current.closeSnackbar(key)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        ref={snackbarProviderRef}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        TransitionComponent={Slide}
        action={(key) => (
          <IconButton onClick={onClickDismiss(key)}>
            <CloseIcon />
          </IconButton>
        )}
        maxSnack={3}
      >
        <Stack
          height="100vh"
          overflow="auto"
          direction="column"
        >
          <UserContext.Provider value={{ user, setUser }}>
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
  )
}

export default App
