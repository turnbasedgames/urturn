const test = require('ava');

const { getNested } = require('../../../../util/util');
const User = require('../../../../../src/models/user/user');

test('User model allows non-negative integer for urbux', (t) => {
  const validUrbuxValues = [0, 1, 2, 3, 5, 8, 13, 21, 1000000000000];
  validUrbuxValues.forEach((urbux) => {
    const user = new User({
      firebaseId: 'testFirebaseId',
      signInProvider: 'testSignInProvider',
      username: 'testUsername',
      urbux,
    });
    const error = user.validateSync();
    t.is(error, undefined);
    t.is(user.urbux, urbux);
  });
});

test('User model default urbux is zero and valid', (t) => {
  const user = new User({
    firebaseId: 'testFirebaseId',
    signInProvider: 'testSignInProvider',
    username: 'testUsername',
  });
  t.is(user.urbux, 0);
  const error = user.validateSync();
  t.is(error, undefined);
});

test('User model provides error if urbux is not a non-negative integer', (t) => {
  const invalidUrbuxValues = [-1, 0.05, 1.0001, 'string', {}, []];
  invalidUrbuxValues.forEach((urbux) => {
    const user = new User({
      firebaseId: 'testFirebaseId',
      signInProvider: 'testSignInProvider',
      username: 'testUsername',
      urbux,
    });
    const error = user.validateSync();
    t.not(error, undefined, `expected error with urbux value: ${urbux}`);
    t.not(getNested(error, 'errors', 'urbux'), undefined, `expected error object to have an error for urbux ${error}`);
  });
});
