const test = require('ava');
const { StatusCodes } = require('http-status-codes');

const { spawnApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const { createUserAndAssert } = require('../util/api_util');

test.before(async (t) => {
  const app = await spawnApp();
  // eslint-disable-next-line no-param-reassign
  t.context.app = app;
});

test.after.always(async (t) => {
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
  const { response: { status } } = await t.throwsAsync(api.get('/user', { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.NOT_FOUND);
});

test('GET /user returns user object', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();
  const { status, data } = await api.get('/user', { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
  t.deepEqual(data, { user });
});

test('POST /user returns 409 if one already exists', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();
  const { response: { status } } = await t.throwsAsync(api.post('/user', {}, { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.CONFLICT);
});

test('POST /user creates user', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
});
