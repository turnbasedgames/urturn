import React, { useState } from 'react';
import {
  AppBar, Button, Toolbar, Typography, IconButton, Stack,
  Link as MuiLink, Tooltip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { GiTwoCoins } from 'react-icons/gi';
import { IoBuild } from 'react-icons/io5';
import { User, DISCORD_URL, DOCS_URL } from '@urturn/types-common';
import { SiDiscord } from 'react-icons/si';
import { logEvent } from 'firebase/analytics';
import { auth, analytics } from '../firebase/setupFirebase';
import Search from './search';
import withUser from '../withUser';
import logger from '../logger';
import UrBuxModal from './urbuxModal';
import { urBux1000Item } from './urbuxModal/util';

interface Props {
  user: User | null
}

function NavBar({ user }: Props): React.ReactElement {
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
        <Tooltip disableFocusListener title="UrBux">
          <Button
            color="secondary"
            startIcon={<GiTwoCoins />}
            onClick={() => {
              setUrBuxModalOpen(true);
              logEvent(analytics, 'view_item', {
                currency: 'USD',
                value: 10,
                items: [
                  urBux1000Item,
                ],
              });
            }}
          >
            <Typography>
              {user.urbux}
            </Typography>
          </Button>
        </Tooltip>
        <Tooltip disableFocusListener title="Create">
          <IconButton
            component={Link}
            to="/develop"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <IoBuild />
          </IconButton>
        </Tooltip>
        <Button
          color="inherit"
          component={Link}
          to="/profile"
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
          sx={{
            marginRight: 1,
            whiteSpace: 'nowrap',
            minWidth: 'auto',
          }}
          onClick={onSignIn}
          variant="outlined"
        >
          Sign In
        </Button>
        <Button
          onClick={onSignIn}
          variant="contained"
          sx={{
            display: { xs: 'none', sm: 'flex' },
            whiteSpace: 'nowrap',
            minWidth: 'auto',
          }}
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
              <MuiLink component={Link} to="/" color="textPrimary" underline="hover">
                <Typography sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  UrTurn
                </Typography>
              </MuiLink>
              <Tooltip disableFocusListener title="Documentation">
                <IconButton
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <SchoolIcon />
                </IconButton>
              </Tooltip>
              <Tooltip disableFocusListener title="Discord">
                <IconButton href={DISCORD_URL} target="_blank" rel="noopener">
                  <SiDiscord />
                </IconButton>
              </Tooltip>
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
