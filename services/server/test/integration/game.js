const test = require('ava');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const { Types } = require('mongoose');

const { createUserCred } = require('../util/firebase');
const { createGameAndAssert, createUserAndAssert } = require('../util/api_util');
const { setupTestFileLogContext } = require('../util/util');
const { setupTestBeforeAfterHooks } = require('../util/app');

setupTestBeforeAfterHooks(test);

setupTestFileLogContext(test);

test('GET /game returns list of games', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  await createGameAndAssert(t, api, userCred, user);
  const { data: { games }, status } = await api.get('/game');
  t.is(status, StatusCodes.OK);
  t.assert(games.length > 0);
});

test('GET /game with search text returns only games searched for by name', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  await createGameAndAssert(t, api, userCred, user, { name: 'Dog Game' });
  await createGameAndAssert(t, api, userCred, user, { name: 'Dog Cat Game' });
  await createGameAndAssert(t, api, userCred, user, { name: 'Hello' });
  await createGameAndAssert(t, api, userCred, user, { name: 'World' });
  await createGameAndAssert(t, api, userCred, user, { name: 'Dog Urturn 100 Billion Dollars Worth' });

  const searchText = 'Dog';
  const { data: { games }, status } = await api.get('/game', { params: { searchText } });

  t.is(status, StatusCodes.OK);
  t.assert(games.length === 3);
});

test('GET /game with search text returns only games searched for by description', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  await createGameAndAssert(t, api, userCred, user, { description: 'Crazy billion dollar game' });
  await createGameAndAssert(t, api, userCred, user, { description: 'Crazy million dollar game' });
  await createGameAndAssert(t, api, userCred, user, { description: 'Crazy game in general' });
  await createGameAndAssert(t, api, userCred, user, { description: 'This game sucks' });
  await createGameAndAssert(t, api, userCred, user, { description: 'This game is very bad' });

  const searchText = 'Crazy';
  const { data: { games }, status } = await api.get('/game', { params: { searchText } });

  t.is(status, StatusCodes.OK);
  t.assert(games.length === 3);
});

test('GET /game can filter for creator', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userCredTwo = await createUserCred(t);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  await createGameAndAssert(t, api, userCredOne, userOne);
  const { data: { games }, status } = await api.get('/game', { params: { creator: userOne.id } });
  t.is(status, StatusCodes.OK);
  t.is(games.length, 1);

  const { data: { games: gamesEmpty }, status: statusEmpty } = await api.get('/game', { params: { creator: userTwo.id } });
  t.is(statusEmpty, StatusCodes.OK);
  t.is(gamesEmpty.length, 0);
});

test('GET /game filtering for unsupported query parameters provides 400 status', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  await createGameAndAssert(t, api, userCred, user);
  const { response: { data: { validation }, status } } = await t.throwsAsync(api.get('/game', { params: { badField: 'evilValue' } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(
    validation,
    {
      query: {
        keys: [
          'badField',
        ],
        message: '"badField" is not allowed',
        source: 'query',
      },
    },
  );
});

test('GET /game/:id returns corresponding game', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const { data: { game: gameRes }, status } = await api.get(`/game/${game.id}`);
  t.is(status, StatusCodes.OK);
  t.deepEqual(gameRes, gameRes);
});

test('GET /game/:id returns 400 if invalid objectid', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get('/game/invalidid'));
  t.is(status, StatusCodes.BAD_REQUEST);
});

test('GET /game/:id returns 404 if game does not exist', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get(`/game/${Types.ObjectId()}`));
  t.is(status, StatusCodes.NOT_FOUND);
});

test('POST /game creates a game', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  await createGameAndAssert(t, api, userCred, user);
});

test('POST /game responds 400 if data is missing fields', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const { response: { status, data: { message } } } = await t.throwsAsync(api.post('/game', {}, { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.true(message.includes('Game validation failed'), message);
});

test('POST /game responds 403 if user trying to modify keys they are not allowed to', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const multipleForbiddenFieldsRes = await t.throwsAsync(api.post('/game', {
    randomField: 0,
    otherField: 2,
    name: 'hello',
    creator: 'cannotspecifythis',
    activePlayerCount: 10000,
  }, { headers: { authorization: authToken } }));
  t.is(multipleForbiddenFieldsRes.response.status, StatusCodes.FORBIDDEN);
  t.is(multipleForbiddenFieldsRes.response.data.message, 'Cannot modify keys: randomField, otherField, creator, activePlayerCount');
});

test('PUT /game/:id updates a game', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCred, user);
  const updateDoc = { name: `integration-tests-${uuidv4()}` };
  const { data: { game: gamePutRes }, status: statusPut } = await api.put(`/game/${game.id}`, updateDoc, { headers: { authorization: authToken } });
  t.is(statusPut, StatusCodes.OK);
  t.deepEqual(gamePutRes, { ...game, ...updateDoc });
  const { data: { game: gameGetRes }, status: statusGet } = await api.get(`/game/${game.id}`);
  t.is(statusGet, StatusCodes.OK);
  t.deepEqual(gameGetRes, gamePutRes);
});

test('PUT /game/:id responds unauthorized if user does not match creator', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const evilUserCred = await createUserCred(t);
  await createUserAndAssert(t, api, evilUserCred);

  const evilAuthToken = await evilUserCred.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCred, user);
  const updateDoc = { name: `integration-tests-${uuidv4()}` };
  const { response: { status: statusPut } } = await t.throwsAsync(api.put(`/game/${game.id}`, updateDoc, { headers: { authorization: evilAuthToken } }));
  t.is(statusPut, StatusCodes.UNAUTHORIZED);

  // game should not have changed after the unauthorized put request
  const { data: { game: gameGetRes }, status: statusGet } = await api.get(`/game/${game.id}`);
  t.is(statusGet, StatusCodes.OK);
  t.deepEqual(gameGetRes, game);
});

test('PUT /game/:id responds not found if game does not exist', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const updateDoc = { name: `integration-tests-${uuidv4()}` };
  const { response: { status: statusPut } } = await t.throwsAsync(api.put(`/game/${Types.ObjectId()}`, updateDoc, { headers: { authorization: authToken } }));
  t.is(statusPut, StatusCodes.NOT_FOUND);
});

test('PUT /game/:id responds 403 if user trying to modify keys they are not allowed to', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCred, user);

  const multipleForbiddenFieldsRes = await t.throwsAsync(api.put(`/game/${game.id}`, {
    randomField: 0,
    otherField: 2,
    name: 'hello',
    creator: 'cannotspecifythis',
    activePlayerCount: 10000,
  }, { headers: { authorization: authToken } }));
  t.is(multipleForbiddenFieldsRes.response.status, StatusCodes.FORBIDDEN);
  t.is(multipleForbiddenFieldsRes.response.data.message, 'Cannot modify keys: randomField, otherField, creator, activePlayerCount');
});

test('DELETE /game/:id deletes a game', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCred, user);
  const { status: statusDel } = await api.delete(`/game/${game.id}`, { headers: { authorization: authToken } });
  t.is(statusDel, StatusCodes.OK);
  const { response: { status: statusGet } } = await t.throwsAsync(api.get(`/game/${game.id}`));
  t.is(statusGet, StatusCodes.NOT_FOUND);
});

test('DELETE /game/:id returns 401 if user does not match creator', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const evilUserCred = await createUserCred(t);
  await createUserAndAssert(t, api, evilUserCred);

  const evilAuthToken = await evilUserCred.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCred, user);
  const { response: { status: statusDel } } = await t.throwsAsync(api.delete(`/game/${game.id}`, { headers: { authorization: evilAuthToken } }));
  t.is(statusDel, StatusCodes.UNAUTHORIZED);

  // game should not have changed after the unauthorized delete request
  const { data: { game: gameGetRes }, status: statusGet } = await api.get(`/game/${game.id}`);
  t.is(statusGet, StatusCodes.OK);
  t.deepEqual(gameGetRes, game);
});

test('DELETE /game/:id returns 404 if game does not exist', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const { response: { status } } = await t.throwsAsync(api.delete(`/game/${Types.ObjectId()}`, { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.NOT_FOUND);
});
