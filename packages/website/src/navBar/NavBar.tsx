import React from 'react';
import {
  AppBar, Button, Toolbar, Typography, IconButton, Stack,
} from '@mui/material';
import firebase from 'firebase/app';
import 'firebase/auth';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useHistory } from 'react-router-dom';

import { User } from '../models/user';
import Search from './search';

type Props = {
  setUser: React.Dispatch<React.SetStateAction<User | null>>
};

const NavBar = ({ setUser }: Props) => {
  const firebaseUser = firebase.auth().currentUser;
  const userLoggedIn = !(firebaseUser === null || firebaseUser.isAnonymous);
  const history = useHistory();

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
            {userLoggedIn
              ? (
                <>
                  <IconButton
                    onClick={() => {
                      history.push('/develop');
                    }}
                  >
                    <AddBoxIcon />
                  </IconButton>
                  <Button
                    onClick={() => {
                      setUser(null);
                      firebase.auth().signOut();
                    }}
                    variant="outlined"
                  >
                    Sign Out
                  </Button>
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

export default NavBar;
