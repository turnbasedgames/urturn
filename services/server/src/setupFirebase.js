const admin = require('firebase-admin');
const logger = require('./logger');

let credential;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS != null) {
  logger.info('Using default Google Application Credentials credentials');
  credential = admin.credential.applicationDefault();
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 != null) {
  logger.warn('Getting Google Application Credentials as an environment variable: GOOGLE_APPLICATION_CREDENTIALS_BASE64');
  logger.warn('This should never be done in production!');
  credential = admin.credential.cert(JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('ascii')));
} else {
  logger.fatal('No Google Application Credential detected for service! It is required for the service to work properly!');
  throw new Error('No firebase credential detected for service!');
}

admin.initializeApp({ credential });
