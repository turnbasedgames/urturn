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

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Stack
          flexGrow="1"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack
            flexGrow="1"
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
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            flexGrow="1"
          >
            {signedIn
              ? (
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
              )
              : (
                <Button
                  onClick={(ev) => {
                    ev.preventDefault();
                    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
                    firebase.auth().signInWithPopup(googleAuthProvider);
                  }}
                  variant="contained"
                >
                  Sign In
                </Button>
              )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default withUser(NavBar);
