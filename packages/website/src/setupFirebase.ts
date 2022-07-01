import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG as string;
const firebaseApp = initializeApp(JSON.parse(Buffer.from(firebaseConfig, 'base64').toString('ascii')));

// eslint-disable-next-line import/prefer-default-export
export const auth = getAuth(firebaseApp);
