const test = require('ava');
const { StatusCodes } = require('http-status-codes');

const { spawnApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const { createUserAndAssert, cleanupTestUsers } = require('../util/api_util');
const { createOrUpdateSideApps } = require('../util/util');

test.before(async (t) => {
  const app = await spawnApp();
  /* eslint-disable no-param-reassign */
  t.context.createdUsers = [];
  t.context.app = app;
  /* eslint-enable no-param-reassign */
});

test.after.always(async (t) => {
  await cleanupTestUsers(t);
  await t.context.app.cleanup();
});

test('GET /user returns 401 if user is not authenticated', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get('/user'));
  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /user returns 401 if invalid token is provided', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get('/user', { headers: { authorization: 'invalid token' } }));
  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /user returns 404 when requester is authenticated but no corresponding user exists', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();
  const { response: { status, data: { name } } } = await t.throwsAsync(api.get('/user', { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.NOT_FOUND);
  t.is(name, 'UserNotFound');
});

test('GET /user returns user object', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  t.context.createdUsers.push(userCred);

  const authToken = await userCred.user.getIdToken();
  const { status, data } = await api.get('/user', { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
  t.deepEqual(data, { user });
});

test('POST /user returns 409 if one already exists', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  t.context.createdUsers.push(userCred);

  const authToken = await userCred.user.getIdToken();
  const { response: { status } } = await t.throwsAsync(api.post('/user', {}, { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.CONFLICT);
});

test('POST /user returns 500 if username generation fails', async (t) => {
  // create a separate app to force the only possible username to be "test"
  const customApp = await spawnApp({ nameDictionary: 'test', nameIterations: 0, forceCreatePersistentDependencies: true });
  createOrUpdateSideApps(t, [customApp]);
  const { api } = customApp;

  // the first user created will be successful and take up the only generated username "test"
  const userCredOne = await createUserCred();
  await createUserAndAssert(t, api, userCredOne);
  t.context.createdUsers.push(userCredOne);

  const userCredTwo = await createUserCred();
  const authTokenTwo = await userCredTwo.user.getIdToken();
  const { response: { status, data: { name } } } = await t.throwsAsync(api.post('/user', {}, { headers: { authorization: authTokenTwo } }));
  t.is(status, StatusCodes.INTERNAL_SERVER_ERROR);
  t.is(name, 'UsernameGeneration');
});

test('POST /user creates user', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  t.context.createdUsers.push(userCred);
});

test('POST /user/create-payment-intent throws error for unsupported currency', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();

  await createUserAndAssert(t, api, userCred);

  const { response: { status } } = await t.throwsAsync(api.post('/user/create-payment-intent', {
    currency: 'ghs',
    amount: 1000,
  }, { headers: { authorization: authToken } }));

  t.is(status, StatusCodes.BAD_REQUEST);

  t.context.createdUsers.push(userCred);
});

test('POST /user/create-payment-intent throws error for any other amount than 100 usd', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();

  await createUserAndAssert(t, api, userCred);

  const { response: { status } } = await t.throwsAsync(api.post('/user/create-payment-intent', {
    currency: 'usd',
    amount: 50,
  }, { headers: { authorization: authToken } }));

  t.is(status, StatusCodes.BAD_REQUEST);

  t.context.createdUsers.push(userCred);
});

test('POST /user/create-payment-intent creates a payment intent for a user', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();

  await createUserAndAssert(t, api, userCred);

  const { status, data } = await api.post('/user/create-payment-intent', {
    currency: 'usd',
    amount: 100,
  }, { headers: { authorization: authToken } });

  t.is(status, StatusCodes.CREATED);
  t.true(data.clientSecret.includes('pi'));

  t.context.createdUsers.push(userCred);
});

test('POST /user username generator adds random numbers when there is a collision', async (t) => {
  // create a separate app to force possible usernames to be "test" and "test_[0-9]"
  const customApp = await spawnApp({ nameDictionary: 'test', nameIterations: 1 });
  createOrUpdateSideApps(t, [customApp]);
  const { api } = customApp;

  // the first user created will be successful and take up the only generated username "test"
  const userCredOne = await createUserCred();
  await createUserAndAssert(t, api, userCredOne);
  t.context.createdUsers.push(userCredOne);

  const userCredTwo = await createUserCred();
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  t.context.createdUsers.push(userCredTwo);
  t.regex(userTwo.username, /test_[0-9]/);
});
