const admin = require('firebase-admin');
const firebase = require('firebase');

require('../../src/setupFirebase');

firebase.initializeApp(JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG, 'base64').toString('ascii')));

async function createUserCred(t) {
  const user = await admin.auth().createUser({});
  const customToken = await admin.auth().createCustomToken(user.uid);
  const userCred = firebase.auth().signInWithCustomToken(customToken);
  t.context.createdUsers.push(userCred);
  return userCred;
}

async function deleteAllTestUsers(nextPageToken) {
  const maxDeleteConcurrency = 2;
  const pageSize = 100;
  const { users, pageToken } = await admin.auth().listUsers(pageSize, nextPageToken);
  // main-231: we should have a way to make it obvious which users are test users via firebase
  // metadata, instead of assuming anonymous users are test users
  const filteredUsers = users.filter((user) => user.providerData.length === 0);

  // limit the concurrency used for user deletion to prevent rate limits
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < filteredUsers.length; i += maxDeleteConcurrency) {
    await Promise.all(filteredUsers.slice(i, i + maxDeleteConcurrency)
      .map((user) => admin.auth().deleteUser(user.uid)));
  }
  /* eslint-enabled no-await-in-loop */
  if (pageToken != null) {
    await deleteAllTestUsers(pageToken);
  }
}

module.exports = {
  deleteAllTestUsers,
  createUserCred,
};
