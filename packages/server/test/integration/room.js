const test = require('ava');
const { StatusCodes } = require('http-status-codes');
const { Types } = require('mongoose');

const { spawnApp, killApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const { createUserAndAssert, createGameAndAssert, createRoomAndAssert } = require('../util/api_util');

async function startTicTacToeRoom(t) {
  const { api } = t.context.app;
  const userCredOne = await createUserCred();
  const userCredTwo = await createUserCred();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  const authTokenTwo = await userCredTwo.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const { data: { room: resRoom }, status } = await api.post(`/room/${room.id}/join`, {},
    { headers: { authorization: authTokenTwo } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(resRoom.leader, userOne);
  t.deepEqual(resRoom.game, game);
  t.deepEqual(resRoom.state, {
    board: [
      [
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
      ],
    ],
    plrs: resRoom.state.plrs,
    state: 'IN_GAME',
    winner: null,
  });
  t.is(resRoom.state.plrs.length, 2);
  t.true(resRoom.state.plrs.indexOf(userOne.id) !== -1);
  t.true(resRoom.state.plrs.indexOf(userTwo.id) !== -1);
  return {
    userOne, userTwo, userCredOne, userCredTwo, game, room: resRoom,
  };
}

test.before(async (t) => {
  const app = await spawnApp();
  // eslint-disable-next-line no-param-reassign
  t.context.app = app;
});

test.after.always(async (t) => {
  await killApp(t.context.app);
});

test('GET /room returns list of rooms', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  await createRoomAndAssert(t, api, userCred, game, user);
  const { data: { rooms }, status } = await api.get(
    '/room', { params: { gameId: game.id } },
  );
  t.is(status, StatusCodes.OK);
  t.assert(rooms.length > 0);
});

test('POST /room creates a room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  await createRoomAndAssert(t, api, userCred, game, user);
});

test('POST /room responds 400 if data is missing fields', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();
  const { response: { data: { message }, status } } = await t.throwsAsync(
    api.post('/room', {}, { headers: { authorization: authToken } }),
  );
  t.is(status, StatusCodes.BAD_REQUEST);
  t.true(message.includes('Room validation failed'), message);
});

test('POST /room returns \'room.game must exist\' if no room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();
  const { response: { status } } = await t.throwsAsync(
    api.post('/room', {
      game: Types.ObjectId(),
      leader: user,
    }, { headers: { authorization: authToken } }),
  );
  t.is(status, StatusCodes.BAD_REQUEST);
});

test('POST /room/:id/join joins a game', async (t) => {
  await startTicTacToeRoom(t);
});

test('POST /room/:id/move invokes creator backend to modify the game state', async (t) => {
  const {
    userOne, userCredOne, userCredTwo, room,
  } = await startTicTacToeRoom(t);
  const { api } = t.context.app;

  // determine who's turn it is
  const { state: { plrs } } = room;
  const plr = plrs[0];
  const userCred = userOne.id === plr ? userCredOne : userCredTwo;
  const authToken = await userCred.user.getIdToken();

  // make move
  const { status } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);

  const { data: { room: { state: { board } } }, status: getStatus } = await api.get(
    `/room/${room.id}`,
  );
  t.is(getStatus, StatusCodes.OK);
  t.deepEqual([
    ['X', null, null],
    [null, null, null],
    [null, null, null]],
  board);
});

test('POST /room/:id/move provides error if user code throws an error', async (t) => {
  const {
    userOne, userCredOne, userCredTwo, room,
  } = await startTicTacToeRoom(t);
  const { api } = t.context.app;

  // determine who's turn it is, and have wrong user make a move
  const { state: { plrs } } = room;
  const plr = plrs[0];
  const userCred = userOne.id === plr ? userCredTwo : userCredOne;
  const authToken = await userCred.user.getIdToken();

  // make move
  const { response: { status } } = await t.throwsAsync(api.post(`/room/${room.id}/move`,
    { x: 0, y: 0 },
    { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.INTERNAL_SERVER_ERROR);
});

test('POST /room/:id/move provides error if user tries to make move when not in the room', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred();
  const userCredTwo = await createUserCred();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  await createUserAndAssert(t, api, userCredTwo);
  const authTokenTwo = await userCredTwo.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const { response: { status } } = await t.throwsAsync(api.post(`/room/${room.id}/move`,
    { x: 0, y: 0 },
    { headers: { authorization: authTokenTwo } }));
  t.is(status, StatusCodes.BAD_REQUEST);
});

test('GET /room/:id returns a room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user);
  const { data, status } = await api.get(
    `/room/${room.id}`,
  );
  t.is(status, StatusCodes.OK);
  t.deepEqual(data.room, room);
});

test('GET /room/:id/user returns a list of users', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user);
  const { data: { users }, status } = await api.get(
    `/room/${room.id}/user`,
  );
  t.is(status, StatusCodes.OK);
  t.assert(users.length > 0);
});

test('GET /:roomId/user/:userId returns true if a user is in a room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user);
  const { status } = await api.get(
    `/room/${room.id}/user/${user.id}`,
  );
  t.is(status, StatusCodes.OK);
});

test('GET /:roomId/user/:userId returns false if a user is not in a room', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const userCredTwo = await createUserCred();
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  const { response: { status } } = await t.throwsAsync(api.get(
    `/room/${room.id}/user/${userTwo.id}`,
  ));

  t.is(status, StatusCodes.NOT_FOUND);
});

test('GET /room/user/:id returns all rooms a user is in', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user);
  const { data: { rooms }, status } = await api.get(
    `/room/user/${user.id}`,
  );
  t.is(status, StatusCodes.OK);
  t.assert(rooms.length === 1);
  t.assert(rooms[0].id === room.id);
});
