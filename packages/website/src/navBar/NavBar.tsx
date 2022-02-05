import React from 'react';
import {
  AppBar, Button, Toolbar, Typography, IconButton, Stack,
} from '@mui/material';
import firebase from 'firebase/app';
import 'firebase/auth';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PersonIcon from '@mui/icons-material/Person';
import { useHistory } from 'react-router-dom';

import Search from './search';
import withUser from '../withUser';
import { User } from '../models/user';

type Props = {
  user: User | null,
};

const NavBar = ({ user }: Props) => {
  const history = useHistory();
  const signedIn = user && !user.firebaseUser.isAnonymous;
  const firebaseUserDetermined = Boolean(firebase.auth().currentUser);

  let userPanel;
  if (signedIn) {
    userPanel = (
      <>
        <IconButton
          onClick={() => {
            history.push('/develop');
          }}
        >
          <AddBoxIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            history.push('/profile');
          }}
        >
          <PersonIcon />
        </IconButton>
      </>
    );
  } else if (firebaseUserDetermined) {
    userPanel = (
      <>
        <Button
          onClick={(ev) => {
            ev.preventDefault();
            const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(googleAuthProvider);
          }}
          variant="outlined"
        >
          Sign In
        </Button>
        <Button
          onClick={(ev) => {
            ev.preventDefault();
            const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(googleAuthProvider);
          }}
          variant="contained"
        >
          Sign Up
        </Button>
      </>
    );
  } else {
    userPanel = <div />;
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
              history.push('/');
            }}
            >
              Turn-Based-Games
            </Typography>
          </Stack>
          <Search />
          <Stack
            flex="1"
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
          >
            {userPanel}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default withUser(NavBar);
