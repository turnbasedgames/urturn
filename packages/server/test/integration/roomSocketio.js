const test = require('ava');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');
const io = require('socket.io-client');

const { spawnApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const {
  getPublicUserFromUser, createUserAndAssert, createGameAndAssert, createRoomAndAssert,
  startTicTacToeRoom,
} = require('../util/api_util');
const { waitFor, createOrUpdateSideApps } = require('../util/util');

async function createSocketAndWatchRoom(baseURL, room) {
  const socket = io(baseURL, { transports: ['websocket'] });
  const emitAsync = promisify(socket.emit).bind(socket);
  await emitAsync('watchRoom', { roomId: room.id });
  socket.messageHistory = [];
  socket.on('room:latestState', (message) => socket.messageHistory.push(message));
  return socket;
}

function waitForNextEvent({ messageHistory }) {
  return waitFor(() => {
    if (messageHistory.length > 0) {
      return messageHistory.shift();
    }
    throw Error('No messages received!');
  },
  1000,
  200,
  "Didn't get room:latestState update");
}

async function assertNextLatestState(t, socket, expectedState) {
  const state = await waitForNextEvent(socket);
  t.deepEqual(state, expectedState);
}

function assertNextSocketLatestState(t, sockets, expectedState) {
  return Promise.all(sockets.map((socket) => assertNextLatestState(t, socket, expectedState)));
}

test.before(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.app = await spawnApp();
});

test.after.always(async (t) => {
  const { app, sideApps } = t.context;
  await app.cleanup();
  if (sideApps) {
    await sideApps.cleanup();
  }
});

test('sockets that emit watchRoom with a room id will get events for room:latestState when the state changes', async (t) => {
  const { api, baseURL } = t.context.app;
  const userCredOne = await createUserCred();
  const userCredTwo = await createUserCred();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const sockets = await Promise.all(
    [...Array(10).keys()].map(() => createSocketAndWatchRoom(baseURL, room)),
  );

  const { data: { room: resRoom }, status } = await api.post(`/room/${room.id}/join`, {},
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(status, StatusCodes.OK);
  t.deepEqual(resRoom, {
    id: room.id,
    game,
    joinable: false,
    finished: false,
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
        plrToMoveIndex: 0,
        status: 'inGame',
        winner: null,
      },
    },
    players: [userOne, userTwo].map(getPublicUserFromUser),
    inactivePlayers: [],
    private: false,
  });

  await assertNextSocketLatestState(t, sockets, {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 1,
    state: {
      board: [[null, null, null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 0,
      status: 'inGame',
      winner: null,
    },
  });

  const { status: statusMove1 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: await userCredOne.user.getIdToken() } });
  t.is(statusMove1, StatusCodes.OK);

  await assertNextSocketLatestState(t, sockets, {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 2,
    state: {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 1,
      status: 'inGame',
      winner: null,
    },
  });

  const { status: statusMove2 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 1 },
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(statusMove2, StatusCodes.OK);

  await assertNextSocketLatestState(t, sockets, {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 3,
    state: {
      board: [['X', 'O', null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 0,
      status: 'inGame',
      winner: null,
    },
  });
});

test('sockets can unwatch a room to no longer receive room:latestState events when state changes', async (t) => {
  const { api, baseURL } = t.context.app;
  const {
    userOne, userTwo, userCredOne, userCredTwo, room,
  } = await startTicTacToeRoom(t);
  const socket1 = await createSocketAndWatchRoom(baseURL, room);
  const socket2 = await createSocketAndWatchRoom(baseURL, room);

  const { status: statusMove1 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: await userCredOne.user.getIdToken() } });
  t.is(statusMove1, StatusCodes.OK);

  await assertNextSocketLatestState(t, [socket1, socket2], {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 2,
    state: {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      status: 'inGame',
      plrToMoveIndex: 1,
      winner: null,
    },
  });

  socket2.emit('unwatchRoom', { roomId: room.id });

  const { status: statusMove2 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 1 },
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(statusMove2, StatusCodes.OK);

  await assertNextLatestState(t, socket1, {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 3,
    state: {
      board: [['X', 'O', null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 0,
      status: 'inGame',
      winner: null,
    },
  });

  await t.throwsAsync(assertNextLatestState(t, socket2, {
    room: room.id,
    version: 3,
    state: {
      board: [['X', 'O', null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 0,
      status: 'inGame',
      winner: null,
    },
  }));
});

test('sockets can be connected to different nodejs instances and receive events for room:latestState', async (t) => {
  const { app } = t.context;
  const sideApps = await Promise.all([...Array(3).keys()]
    .map(() => spawnApp({ defaultMongoEnv: app.envWithMongo, defaultRedisEnv: app.envWithRedis })));
  createOrUpdateSideApps(t, sideApps);

  const { api } = app;
  const {
    userOne, userTwo, userCredOne, userCredTwo, room,
  } = await startTicTacToeRoom(t);
  const sockets = await Promise.all([...Array(10).keys()].map((_, index) => {
    const apps = [app, ...sideApps];
    return createSocketAndWatchRoom(apps[index % 4].baseURL, room);
  }));

  const { status: statusMove1 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 0 },
    { headers: { authorization: await userCredOne.user.getIdToken() } });
  t.is(statusMove1, StatusCodes.OK);

  await assertNextSocketLatestState(t, sockets, {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 2,
    state: {
      board: [['X', null, null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 1,
      status: 'inGame',
      winner: null,
    },
  });

  const { status: statusMove2 } = await api.post(`/room/${room.id}/move`, { x: 0, y: 1 },
    { headers: { authorization: await userCredTwo.user.getIdToken() } });
  t.is(statusMove2, StatusCodes.OK);

  await assertNextSocketLatestState(t, sockets, {
    finished: false,
    joinable: false,
    players: [userOne, userTwo].map(getPublicUserFromUser),
    version: 3,
    state: {
      board: [['X', 'O', null], [null, null, null], [null, null, null]],
      plrToMoveIndex: 0,
      status: 'inGame',
      winner: null,
    },
  });
});
