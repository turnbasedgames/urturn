import React, { useState } from 'react';
import {
  AppBar, Button, Toolbar, Typography, IconButton, Stack,
  Link,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { GiTwoCoins } from 'react-icons/gi';
import { IoBuild } from 'react-icons/io5';
import { User } from '@urturn/types-common';

import { auth } from '../firebase/setupFirebase';
import Search from './search';
import withUser from '../withUser';
import logger from '../logger';
import UrBuxModal from './urbuxModal';

interface Props {
  user: User | null
}

function NavBar({ user }: Props): React.ReactElement {
  const navigate = useNavigate();
  const [urbuxModalOpen, setUrBuxModalOpen] = useState(false);
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
          onClick={() => { setUrBuxModalOpen(true); }}
        >
          <Typography>
            {user.urbux}
          </Typography>
        </Button>
        <IconButton
          sx={{ display: { xs: 'none', sm: 'flex' } }}
          onClick={() => {
            navigate('/develop');
          }}
        >
          <IoBuild />
        </IconButton>
        <Button
          color="inherit"
          onClick={() => {
            navigate('/profile');
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
    <>
      <UrBuxModal open={urbuxModalOpen} setOpen={setUrBuxModalOpen} />
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
              spacing={1}
            >
              <Link href="/" color="textPrimary" underline="hover">
                <Typography sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  UrTurn
                </Typography>
              </Link>
              <IconButton href="https://docs.urturn.app/" target="_blank" rel="noopener">
                <ArticleIcon />
              </IconButton>
            </Stack>
            <Search />
            <Stack
              flex="1"
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              marginLeft={1}
            >
              {userPanel}
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default withUser(NavBar);
