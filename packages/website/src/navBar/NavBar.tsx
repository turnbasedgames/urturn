import React from 'react'
import {
  AppBar, Button, Toolbar, Typography, IconButton, Stack
} from '@mui/material'
import AddBoxIcon from '@mui/icons-material/AddBox'
import PersonIcon from '@mui/icons-material/Person'
import { useHistory } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

import { auth } from '../firebase/setupFirebase'
import Search from './search'
import withUser from '../withUser'
import { User } from '../models/user'

interface Props {
  user: User | null
}

const NavBar = ({ user }: Props) => {
  const history = useHistory()
  const signedIn = (user != null) && !user.firebaseUser.isAnonymous
  const firebaseUserDetermined = Boolean(auth.currentUser)

  let userPanel
  if (signedIn) {
    userPanel = (
      <>
        <IconButton
          onClick={() => {
            history.push('/develop')
          }}
        >
          <AddBoxIcon />
        </IconButton>
        <Button
          onClick={() => {
            history.push('/profile')
          }}
          size="small"
        >
          <PersonIcon />
          <Typography
            variant="button"
            component="div"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            {user.username}
          </Typography>
        </Button>
      </>
    )
  } else if (firebaseUserDetermined) {
    userPanel = (
      <>
        <Button
          onClick={(ev) => {
            ev.preventDefault()
            const googleAuthProvider = new GoogleAuthProvider()
            signInWithPopup(auth, googleAuthProvider)
          }}
          variant="outlined"
        >
          Sign In
        </Button>
        <Button
          onClick={(ev) => {
            ev.preventDefault()
            const googleAuthProvider = new GoogleAuthProvider()
            signInWithPopup(auth, googleAuthProvider)
          }}
          variant="contained"
        >
          Sign Up
        </Button>
      </>
    )
  } else {
    userPanel = <div />
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Stack
          width="100%"
          direction="row"
          alignItems="center"
        >
          <Stack
            flex="1"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Typography onClick={() => {
              history.push('/')
            }}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              UrTurn
            </Typography>
          </Stack>
          <Search />
          <Stack
            flex="1"
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            {userPanel}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default withUser(NavBar)
