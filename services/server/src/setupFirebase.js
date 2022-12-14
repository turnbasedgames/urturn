const admin = require('firebase-admin');
const logger = require('./logger');

const { GOOGLE_APPLICATION_CREDENTIALS_BASE64 } = process.env;

if (process.env.NODE_ENV === 'production') {
  logger.info('Detected production environment, which must use application default credentials (ADC).');
  logger.info('Using default Google Application Credentials credentials');
  admin.initializeApp();
} else if (GOOGLE_APPLICATION_CREDENTIALS_BASE64 != null) {
  logger.warn('Getting Google Application Credentials as an environment variable: GOOGLE_APPLICATION_CREDENTIALS_BASE64');
  logger.warn('This should never be done in production!');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(Buffer.from(GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('ascii'))) });
} else {
  logger.error('No Google Application Credential detected for service! It is required for the service to work properly!');
  throw new Error('No firebase credential detected for service!');
}
