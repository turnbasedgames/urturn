import axios from 'axios';
import firebase from 'firebase/app';
import { createContext } from 'react';
import { StatusCodes } from 'http-status-codes';

export interface User {
  id: string,
  firebaseID: string,
  firebaseUser: firebase.User
  signInProvider: string,
}

export const getUser = async (firebaseUser: firebase.User, upsert: boolean): Promise<User> => {
  let user;
  try {
    const getResult = await axios.get('/api/user');
    user = getResult.data.user;
  } catch (err) {
    if (err.response.status === StatusCodes.NOT_FOUND && upsert) {
      const postResult = await axios.post('/api/user', {});
      user = postResult.data.user;
    } else {
      throw err;
    }
  }
  user.firebaseUser = firebaseUser;
  return user as User;
};

export const createUser = async () => {

};

interface UserContextProps {
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

export const UserContext = createContext<UserContextProps>({} as UserContextProps);
