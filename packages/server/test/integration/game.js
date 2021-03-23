const test = require('ava');
const { StatusCodes } = require('http-status-codes');

const { spawnApp, killApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const { createGameAndAssert, createUserAndAssert } = require('../util/api_util');

test.before(async (t) => {
  const app = await spawnApp();
  // eslint-disable-next-line no-param-reassign
  t.context.app = app;
});

test.after.always(async (t) => {
  await killApp(t.context.app);
});

test('GET /game returns list of games', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  await createGameAndAssert(t, api, userCred, user);
  const { data: { games }, status } = await api.get('/game');
  t.is(status, StatusCodes.OK);
  t.assert(games.length > 0);
});

test('POST /game creates a game', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  await createGameAndAssert(t, api, userCred, user);
});

test('POST /game responds 400 if data is missing fields', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();
  const { response: { status, data: { message } } } = await t.throwsAsync(api.post('/game', {}, { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.true(message.includes('Game validation failed'), message);
});

test('GET /game/:id returns corresponding game', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  const { data, status } = await api.get(`/game/${game.id}`);
  t.is(status, StatusCodes.OK);
  t.deepEqual(data, { game });
});

test('GET /game/:id returns 400 if invalid objectid', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get('/game/invalidid'));
  t.is(status, StatusCodes.BAD_REQUEST);
});
