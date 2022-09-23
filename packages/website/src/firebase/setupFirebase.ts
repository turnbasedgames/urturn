import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { Buffer } from 'buffer'

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG as string
const firebaseApp = initializeApp(JSON.parse(Buffer.from(firebaseConfig, 'base64').toString('ascii')))

export const auth = getAuth(firebaseApp)

export const analytics = getAnalytics(firebaseApp)
