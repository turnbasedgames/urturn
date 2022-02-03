const admin = require('firebase-admin');
const firebase = require('firebase');

require('../../src/setupFirebase');

firebase.initializeApp(JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG, 'base64').toString('ascii')));

async function createUserCred() {
  const user = await admin.auth().createUser({});
  const customToken = await admin.auth().createCustomToken(user.uid);
  const userCred = firebase.auth().signInWithCustomToken(customToken);
  return userCred;
}

async function deleteAllUsers() {
  const { users } = await admin.auth().listUsers();
  // limit the concurrency used for user deletion to prevent rate limits
  const maxDeleteConcurrency = 5;
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < users.length; i += maxDeleteConcurrency) {
    await Promise.all(users.slice(i, i + maxDeleteConcurrency)
      .map((user) => admin.auth().deleteUser(user.uid)));
  }
  /* eslint-enabled no-await-in-loop */
}

module.exports = {
  deleteAllUsers,
  createUserCred,
};
