import { Meta, Story } from '@storybook/react';
import { User } from '@urturn/types-common';
import React from 'react';
import logger from '../../logger';

import RoomPlayer from './RoomPlayer';
import { RoomPlayerProps } from './RoomPlayer.types';

const defaultUser: User = {
  id: 'user-id-1',
  username: 'user-1',
  firebaseID: 'firebase-id',
  firebaseUser: {
    isAnonymous: false,
    email: 'example@gmail.com',
    uid: 'firebase-id',
    emailVerified: true,
    metadata: {},
    providerData: [],
    refreshToken: 'refresh-token',
    tenantId: 'tenantId',
    delete: async () => {},
    getIdToken: async (forceRefresh) => `id-token-${String(forceRefresh)}`,
    getIdTokenResult: async (forceRefresh) => ({
      authTime: 'authTime',
      expirationTime: 'expirationTime',
      issuedAtTime: 'issuedAtTime',
      signInProvider: null,
      signInSecondFactor: null,
      token: `token${String(forceRefresh)}`,
      claims: {},
    }),
    reload: async () => {},
    toJSON: () => ({}),
    displayName: 'testing',
    phoneNumber: null,
    photoURL: null,
    providerId: 'providerId',
  },
  signInProvider: 'google',
  urbux: 0,
};

const meta: Meta = {
  component: RoomPlayer,
};
export default meta;

// eslint-disable-next-line react/jsx-props-no-spreading, react/function-component-definition
const Template: Story<RoomPlayerProps> = (args) => <RoomPlayer {...args} />;

export const Default = Template.bind({});
Default.args = {
  src: 'http://localhost:3000',
  user: defaultUser,
  setChildClient: (childClient: any) => logger.info('setting child client', { childClient }),
  makeMove: async (move: any) => logger.info('make move called', { move }),
  quitRoom: async () => logger.info('attempting to quit room'),
  players: [
    { id: defaultUser.id, username: defaultUser.username },
    { id: 'user-id-2', username: 'billy' },
  ],
};
