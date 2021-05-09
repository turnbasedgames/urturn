import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import axios from 'axios';
import NavBar from './navBar';
import GameView from './gameView';
import CreateView from './createView';
import { getUser, User, UserContext } from './models/user';
import firebaseConfig from './firebaseConfig';
import classes from './App.module.css';

firebase.initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const authInterceptor = axios.interceptors.request.use(async (config) => {
      const newConfig = config;
      const firebaseUser = firebase.auth().currentUser;
      if (firebaseUser) {
        if (!newConfig.headers) {
          newConfig.headers = {};
        }
        newConfig.headers.authorization = await firebaseUser.getIdToken();
      }
      return newConfig;
    });

    firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        firebase.auth().signInAnonymously();
      } else {
        const currentUser = await getUser(firebaseUser, true);
        setUser(currentUser);
      }
    });

    return () => { axios.interceptors.request.eject(authInterceptor); };
  }, []);

  return (
    <div className={classes.container}>
      <UserContext.Provider value={{ user, setUser }}>
        <Router>
          <NavBar setUser={setUser} />
          <Switch>
            <Route exact path="/">
              <Redirect to="/games" />
            </Route>
            <Route path="/games">
              <GameView />
            </Route>
            <Route path="/create">
              <CreateView />
            </Route>
          </Switch>
        </Router>
      </UserContext.Provider>
    </div>
  );
}

export default App;
