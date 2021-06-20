const admin = require('firebase-admin');
const firebase = require('firebase');

require('../../src/setupFirebase');

firebase.initializeApp(JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG, 'base64').toString('ascii')));
const bucket = admin.storage().bucket();

async function createUserCred() {
  const user = await admin.auth().createUser({});
  const customToken = await admin.auth().createCustomToken(user.uid);
  const userCred = firebase.auth().signInWithCustomToken(customToken);
  return userCred;
}

async function deleteAllUsers() {
  const { users } = await admin.auth().listUsers();
  const [userFiles] = await bucket.getFiles({ prefix: 'users/' });
  await Promise.all(users.map((user) => admin.auth().deleteUser(user.uid)));
  await Promise.all(userFiles.map((file) => file.delete()));
}

module.exports = {
  deleteAllUsers,
  createUserCred,
};
