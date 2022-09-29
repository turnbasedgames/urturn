import axios from 'axios';
import { User as FirebaseUser } from 'firebase/auth';
import { createContext } from 'react';
import { StatusCodes } from 'http-status-codes';
import { User } from '@urturn/types-common';

export enum Errors {
  UserNotFound = 'UserNotFound',
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
