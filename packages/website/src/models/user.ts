import axios from 'axios';
import { User as FirebaseUser } from 'firebase/auth';
import { createContext } from 'react';
import { StatusCodes } from 'http-status-codes';

export enum Errors {
  UserNotFound = 'UserNotFound',
}

// this User class is meant to describe the current authenticated user
export interface User {
  id: string
  username: string
  firebaseID: string
  firebaseUser: FirebaseUser
  signInProvider: string
  urbux: number
}

// fields in RoomUser are visible publically, and used to describe ANY user (e.g. playing game with)
export interface RoomUser {
  id: string
  username: string
}

export const getUser = async (firebaseUser: FirebaseUser, upsert: boolean): Promise<User> => {
  let user;
  try {
    const getResult = await axios.get('user', {
      params: {
        includePrivate: true,
      },
    });
    user = getResult.data.user;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === StatusCodes.NOT_FOUND && upsert) {
      const postResult = await axios.post('user', {});
      user = postResult.data.user;
    } else {
      throw err;
    }
  }
  user.firebaseUser = firebaseUser;
  return user as User;
};

interface UserContextProps {
  user?: User
  setUser?: React.Dispatch<React.SetStateAction<User | undefined>>
}

const defaultUserContext: UserContextProps = {};
export const UserContext = createContext<UserContextProps>(defaultUserContext);
