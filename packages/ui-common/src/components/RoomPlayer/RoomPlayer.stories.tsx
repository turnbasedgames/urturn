import { ComponentMeta, ComponentStory } from '@storybook/react';
import { User } from '@urturn/types-common';

import RoomPlayer from './RoomPlayer';

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

const componentMeta: ComponentMeta<typeof RoomPlayer> = {
  title: '@urturn/RoomPlayer',
  component: RoomPlayer,
};
export default componentMeta;

const Template: ComponentStory<typeof RoomPlayer> = RoomPlayer;

export const Default = Template.bind({});
Default.args = {
  src: 'testing',
  user: defaultUser,
  setChildClient: (childClient: any) => console.log('setting child client', { childClient }),
  makeMove: (move: any) => console.log('make move called', { move }),
};
