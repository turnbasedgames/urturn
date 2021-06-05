const test = require('ava');
const { CancelToken } = require('axios');
const { StatusCodes } = require('http-status-codes');
const { Types } = require('mongoose');

const { spawnApp, killApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const { createUserAndAssert, createGameAndAssert, createRoomAndAssert } = require('../util/api_util');
const { waitFor } = require('../util/util');

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
  t.deepEqual(resRoom.latestState.state, {
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
    plrs: [userOne.id, userTwo.id],
    state: 'IN_GAME',
    winner: null,
  });
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
  const { userCredOne, room } = await startTicTacToeRoom(t);
  const { api } = t.context.app;
  const authToken = await userCredOne.user.getIdToken();

  // make move
  const { status } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
  const {
    data: { room: { latestState: { state: { board } } } },
    status: getStatus,
  } = await api.get(`/room/${room.id}`);
  t.is(getStatus, StatusCodes.OK);
  t.deepEqual([
    ['X', null, null],
    [null, null, null],
    [null, null, null]],
  board);
});

test('POST /room/:id/move provides error if user code throws an error', async (t) => {
  const { userCredTwo, room } = await startTicTacToeRoom(t);
  const { api } = t.context.app;

  // make move with user2 (it's user1's turn!)
  const authToken = await userCredTwo.user.getIdToken();
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

test('GET /room/:id/latestState provides the latestState of a room', async (t) => {
  const { api } = t.context.app;
  const { userOne, userTwo, room } = await startTicTacToeRoom(t);
  const { data: { latestState }, status } = await api.get(`/room/${room.id}/latestState`);
  t.is(status, StatusCodes.OK);
  t.deepEqual(latestState, {
    id: latestState.id,
    room: room.id,
    state: {
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
      plrs: [userOne.id, userTwo.id],
      state: 'IN_GAME',
      winner: null,
    },
    version: 1,
  });
});

test('GET /room/:id/latestState supports watch query parameter', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred();
  const userCredTwo = await createUserCred();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const waitForWatchesState = (watches) => Promise.all(watches.map(({ data }) => waitFor(
    async () => JSON.parse((await data.read()).toString()),
    1000,
    200,
    "Didn't get room update",
  )));
  const assertNextWatchesState = async (watches, expectedState) => {
    const watchStates = await waitForWatchesState(watches);
    watchStates.forEach((state) => t.deepEqual(state, { id: state.id, ...expectedState }));
  };
  const watches = await Promise.all([...Array(10).keys()].map(() => api.get(
    `/room/${room.id}/latestState?watch=true`,
    { responseType: 'stream' },
  )));
  await assertNextWatchesState(watches, {
    room: room.id,
    version: 0,
    state: {
      state: 'NOT_STARTED',
      board: [[null, null, null], [null, null, null], [null, null, null]],
      plrs: [userOne.id],
      winner: null,
    },
  });

  const { data: { room: resRoom }, status } = await api.post(`/room/${room.id}/join`, {},
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(resRoom, {
    id: room.id,
    leader: userOne,
    game,
    latestState: {
      id: resRoom.latestState.id,
      version: 1,
      room: room.id,
      state: {
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
        plrs: [userOne.id, userTwo.id],
        state: 'IN_GAME',
        winner: null,
      },
    },
  });

  await assertNextWatchesState(watches, {
    room: room.id,
    version: 1,
    state: {
      board: [[null, null, null], [null, null, null], [null, null, null]],
      plrs: [userOne.id, userTwo.id],
      state: 'IN_GAME',
      winner: null,
    },
  });

  const { status: statusMove1 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: await userCredOne.user.getIdToken() } });
  t.is(statusMove1, StatusCodes.OK);

  await assertNextWatchesState(watches, {
    room: room.id,
    version: 2,
    state: {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      plrs: [userOne.id, userTwo.id],
      state: 'IN_GAME',
      winner: null,
    },
  });

  const { status: statusMove2 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 1 },
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(statusMove2, StatusCodes.OK);

  await assertNextWatchesState(watches, {
    room: room.id,
    version: 3,
    state: {
      board: [['X', 'O', null], [null, null, null], [null, null, null]],
      plrs: [userOne.id, userTwo.id],
      state: 'IN_GAME',
      winner: null,
    },
  });
});

test('GET /room/:id/latestState client cancels watch stream without affecting other subscribers', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred();
  const userCredTwo = await createUserCred();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const source1 = CancelToken.source();
  const source2 = CancelToken.source();
  const { data: watchToCancel } = await api.get(
    `/room/${room.id}/latestState?watch=true`,
    { responseType: 'stream', cancelToken: source1.token },
  );
  const { data: watchOngoing } = await api.get(
    `/room/${room.id}/latestState?watch=true`,
    { responseType: 'stream', cancelToken: source2.token },
  );
  const waitForNextWatchState = (watch) => waitFor(
    async () => JSON.parse((await watch.read()).toString()),
    1000,
    200,
    "Didn't get room update",
  );
  const assertNextWatchState = async (watch, expectedState) => {
    const state = await waitForNextWatchState(watch);
    t.deepEqual(state, { id: state.id, ...expectedState });
  };
  const expectedState = {
    room: room.id,
    version: 0,
    state: {
      state: 'NOT_STARTED',
      board: [[null, null, null], [null, null, null], [null, null, null]],
      plrs: [userOne.id],
      winner: null,
    },
  };
  await assertNextWatchState(watchToCancel, expectedState);
  await assertNextWatchState(watchOngoing, expectedState);

  // after cancelling the chunked request, watchToCancel should not be receiving messages
  source1.cancel();

  const { data: { room: resRoom }, status } = await api.post(`/room/${room.id}/join`, {},
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(resRoom, {
    id: room.id,
    leader: userOne,
    game,
    latestState: {
      id: resRoom.latestState.id,
      version: 1,
      room: room.id,
      state: {
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
        plrs: [userOne.id, userTwo.id],
        state: 'IN_GAME',
        winner: null,
      },
    },
  });

  await assertNextWatchState(watchOngoing, {
    room: room.id,
    version: 1,
    state: {
      board: [[null, null, null], [null, null, null], [null, null, null]],
      plrs: [userOne.id, userTwo.id],
      state: 'IN_GAME',
      winner: null,
    },
  });

  const { status: statusMove1 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: await userCredOne.user.getIdToken() } });
  t.is(statusMove1, StatusCodes.OK);

  await assertNextWatchState(watchOngoing, {
    room: room.id,
    version: 2,
    state: {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      plrs: [userOne.id, userTwo.id],
      state: 'IN_GAME',
      winner: null,
    },
  });

  source2.cancel();

  const { status: statusMove2 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 1 },
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(statusMove2, StatusCodes.OK);
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
