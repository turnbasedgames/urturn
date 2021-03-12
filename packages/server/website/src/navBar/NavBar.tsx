import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import {
  AppBar, Toolbar, Typography, InputBase, Button,
} from '@material-ui/core';
import {
  fade, withStyles, createStyles, Theme,
} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import {
  Link, useHistory,
} from 'react-router-dom';

import { User } from '../models/user';

type Props = {
  classes: any
  setUser: React.Dispatch<React.SetStateAction<User | null>>
};

const NavBar = ({ classes, setUser }: Props) => {
  const firebaseUser = firebase.auth().currentUser;
  const showLogin = firebaseUser === null || firebaseUser.isAnonymous;
  const history = useHistory();

  return (
    <div>
      <AppBar className={classes.appBar} position="fixed">
        <Toolbar variant="dense" className={classes.bar}>
          <div className={classes.subBarLeft}>
            <Link to="/games">
              <Typography variant="h6">Platform</Typography>
            </Link>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              className={classes.button}
              onClick={(ev) => {
                ev.preventDefault();
                history.push('/create');
              }}
            >
              Create
            </Button>
          </div>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
          <div className={classes.subBarRight}>
            {showLogin && (
            <Button
              variant="contained"
              color="primary"
              disableElevation
              className={classes.button}
              onClick={(ev) => {
                ev.preventDefault();
                const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithPopup(googleAuthProvider);
              }}
            >
              sign in with google
            </Button>
            )}
            {!showLogin && (
            <Button
              onClick={() => {
                setUser(null);
                firebase.auth().signOut();
              }}
            >
              sign out
            </Button>
            )}
          </div>

        </Toolbar>
      </AppBar>
    </div>
  );
};

const styles = (theme: Theme) => createStyles({
  appBar: {
    backgroundColor: theme.palette.grey[500],
  },
  bar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subBarLeft: {
    display: 'flex',
    flex: 1,
  },
  subBarRight: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    margin: '5px',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
});

export default withStyles(styles)(NavBar);
