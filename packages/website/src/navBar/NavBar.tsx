import React from 'react';
import {
  AppBar, Button, Toolbar, Typography, IconButton, Stack, Link,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useHistory } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { GiTwoCoins } from 'react-icons/gi';
import { IoBuild } from 'react-icons/io5';
import { SiDiscord } from 'react-icons/si';
import { User } from '@urturn/types-common';

import { auth } from '../firebase/setupFirebase';
import Search from './search';
import withUser from '../withUser';
import { DISCORD_URL } from '../util';
import logger from '../logger';

interface Props {
  user: User | null
}

function NavBar({ user }: Props): React.ReactElement {
  const history = useHistory();
  const signedIn = (user != null) && !user.firebaseUser.isAnonymous;
  const firebaseUserDetermined = Boolean(auth.currentUser);
  const onSignIn = (ev: React.MouseEvent): void => {
    ev.preventDefault();
    const googleAuthProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleAuthProvider).catch(logger.error);
  };

  let userPanel;
  if (signedIn) {
    userPanel = (
      <>
        <Button
          color="secondary"
          startIcon={<GiTwoCoins />}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          <Typography>
            {user.urbux}
          </Typography>
        </Button>
        <IconButton
          onClick={() => {
            history.push('/develop');
          }}
        >
          <IoBuild />
        </IconButton>
        <Button
          color="inherit"
          onClick={() => {
            history.push('/profile');
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
    );
  } else if (firebaseUserDetermined) {
    userPanel = (
      <>
        <Button
          sx={{ marginRight: 1 }}
          onClick={onSignIn}
          variant="outlined"
        >
          Sign In
        </Button>
        <Button
          onClick={onSignIn}
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
      <Toolbar variant="dense">
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
            <Link href="/" color="textPrimary" underline="hover">
              <Typography sx={{ display: { xs: 'none', sm: 'flex' } }}>
                UrTurn
              </Typography>
            </Link>
            <IconButton href={DISCORD_URL}>
              <SiDiscord />
            </IconButton>
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
  );
}

export default withUser(NavBar);
