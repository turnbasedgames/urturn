const test = require('ava');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');
const io = require('socket.io-client');
const mongoose = require('mongoose');

const { spawnApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const {
  getPublicUserFromUser, createUserAndAssert, createGameAndAssert, createRoomAndAssert,
  startTicTacToeRoom, getRoomAndAssert,
} = require('../util/api_util');
const {
  waitFor, createOrUpdateSideApps, setupTestFileLogContext, sleep,
} = require('../util/util');

const disconnectTimeoutSecs = 30;
const disconnectAssertionBufferSecs = 10;
const rightBeforeDisconnectTimeoutMs = (disconnectTimeoutSecs - disconnectAssertionBufferSecs)
 * 1000;
const timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs = disconnectAssertionBufferSecs
 * 2 * 1000;

const socketConfigs = [{
  name: 'http polling only',
  config: { transports: ['polling'] },
}, {
  name: 'websocket only',
  config: { transports: ['websocket'] },
},
{
  name: 'any transport',
  config: {},
}];

function createSocket(t, baseURL, baseConfig) {
  const socketConfig = { extraHeaders: {}, ...baseConfig };
  socketConfig.extraHeaders['x-correlation-id'] = t.context.cid;
  const socket = io(baseURL, socketConfig);
  socket.data = {};
  socket.data.socketConfig = socketConfig;
  socket.on('connect', () => {
    t.context.log({
      message: 'socket received connect event',
      socketInfo: { id: socket.id, connected: socket.connected, disconnected: socket.disconnected },
    });
  });

  socket.data.disconnectEvents = [];
  socket.on('disconnect', (reason, details) => {
    t.context.log({
      message: 'socket received disconnect event',
      socketInfo: { id: socket.id, connected: socket.connected, disconnected: socket.disconnected },
      reason,
      details,
    });
    socket.data.disconnectEvents.push({ reason, details });
  });

  socket.data.messageHistory = [];
  socket.on('room:latestState', (event) => {
    t.context.log({
      message: 'socket received room:latestState event',
      socketInfo: { id: socket.id, connected: socket.connected, disconnected: socket.disconnected },
      version: event.version,
    });
    socket.data.messageHistory.push(event);
  });

  socket.data.connectErrors = [];
  socket.on('connect_error', (err) => {
    t.context.log({
      message: 'socket received connect_error event',
      socketInfo: { id: socket.id, connected: socket.connected, disconnected: socket.disconnected },
      err,
    });
    socket.data.connectErrors.push(err);
  });
  return socket;
}

async function watchRoom(t, socket, room, assert = true) {
  const emitAsync = promisify(socket.emit).bind(socket);
  try {
    await emitAsync('watchRoom', { roomId: room.id });
    if (assert) {
      const { mongoClientDatabase } = t.context.app;
      const userSockets = await mongoClientDatabase.collection('usersockets').find({ socketId: socket.id }).toArray();
      t.is(userSockets.length, 1);
      t.is(userSockets[0].socketId, socket.id);
      t.is(userSockets[0].user.toString(), socket.data.socketConfig.user.id);
      t.is(userSockets[0].room.toString(), room.id);
      t.is(userSockets[0].game.toString(), room.game.id);
    }
  } catch (err) {
    const errorObj = new Error('Error while watching room');
    errorObj.message = err.error;
    errorObj.socketId = socket.id;
    errorObj.roomid = room.id;
    errorObj.socketData = socket.data;
    t.context.log('error watching room:', errorObj);
    throw errorObj;
  }
}

async function createSocketAndWatchRoom(t, baseURL, room, socketConfig) {
  const socket = createSocket(t, baseURL, socketConfig);
  await watchRoom(t, socket, room);
  return socket;
}

function waitForConnected(logFn, socket) {
  return waitFor(
    logFn,
    () => {
      if (socket.connected) {
        return true;
      }
      throw Error('Socket not connected');
    },
    10000,
    200,
    'Socket never got connected',
  );
}

function waitForDisconnected(logFn, socket) {
  return waitFor(
    logFn,
    () => {
      if (!socket.connected && socket.data.disconnectEvents.length > 0) {
        return true;
      }
      logFn('Socket not disconnected', socket.data.disconnectEvents, socket.connected);
      throw Error('Socket not disconnected');
    },
    10000,
    200,
    'Socket never got disconnected',
  );
}

function waitForNextConnectError(logFn, socket) {
  return waitFor(
    logFn,
    () => {
      if (socket.data.connectErrors.length > 0) {
        return socket.data.connectErrors.shift();
      }
      throw Error('No messages received!');
    },
    10000,
    200,
    "Didn't get any connect errors",
  );
}

function waitForNextEvent(logFn, socket) {
  return waitFor(
    logFn,
    () => {
      if (socket.data.messageHistory.length > 0) {
        return socket.data.messageHistory.shift();
      }
      throw Error('No messages received!');
    },
    1000,
    200,
    "Didn't get room:latestState update",
  );
}

async function assertNextLatestState(t, socket, expectedState) {
  const state = await waitForNextEvent(t.context.log, socket);
  t.deepEqual(state, expectedState);
}

function assertNextSocketLatestState(t, sockets, expectedState) {
  return Promise.all(sockets.map((socket) => assertNextLatestState(t, socket, expectedState)));
}

async function getActivePlayerCountAndAssert(t, gameId) {
  const { api } = t.context.app;
  const { status, data: { game: gameWithSocketsConnected } } = await api.get(`/game/${gameId}`);
  t.is(status, StatusCodes.OK);
  return gameWithSocketsConnected.activePlayerCount;
}

async function assertActivePlayerCount(t, gameId, count) {
  t.is(await getActivePlayerCountAndAssert(t, gameId), count);
}

test.before(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.app = await spawnApp(t);
});

setupTestFileLogContext(test);

test.after.always(async (t) => {
  const { app, sideApps } = t.context;
  await app.cleanup();
  if (sideApps) {
    await sideApps.cleanup();
  }
});

socketConfigs.forEach(({ name, config }) => {
  test(`sockets (${name}) that emit watchRoom with a room id will get events for room:latestState when the state changes`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userCredTwo = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const userTwo = await createUserAndAssert(t, api, userCredTwo);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);
    const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
    const sockets = await Promise.all(
      [...Array(6).keys()].map((ind) => createSocketAndWatchRoom(
        t,
        baseURL,
        room,
        {
          ...config,
          auth: (cb) => {
            const authTokenPromise = (ind % 2 === 0)
              ? userCredOne.user.getIdToken() : userCredTwo.user.getIdToken();
            authTokenPromise.then((token) => cb({ token })).catch((error) => {
              t.context.log({
                message: 'unable to get auth token',
                error,
              });
            });
          },
          user: (ind % 2 === 0) ? userOne : userTwo,
        },
      )),
    );

    // only 2 unique players watching room, so even though there are 6 sockets, activePlayerCount
    // should be 2
    await assertActivePlayerCount(t, game.id, 2);

    const { data: { room: resRoom }, status } = await api.post(`/room/${room.id}/join`, {},
      { headers: { authorization: await userCredTwo.user.getIdToken() } });
    t.is(status, StatusCodes.OK);
    t.deepEqual(resRoom, {
      id: room.id,
      game: { ...game, activePlayerCount: 2 },
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
          emptyObject: {},
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
        emptyObject: {},
      },
    });
    await assertActivePlayerCount(t, game.id, 2);

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
        emptyObject: {},
      },
    });
    await assertActivePlayerCount(t, game.id, 2);

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
        emptyObject: {},
      },
    });
  });

  test(`sockets (${name}) that emit watchRoom with a room id cannot watch another room`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);
    const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
    const socket = await createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user: userOne,
      },
    );

    const error = await t.throwsAsync(watchRoom(t, socket, room, false));
    t.is(error.message, `Error: Socket already connected to a room: ${room.id}`);
  });

  test(`sockets (${name}) that emit watchRoom with an invalid room id will get an error`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    await createUserAndAssert(t, api, userCredOne);
    const socket = createSocket(t, baseURL, {
      ...config,
      auth: (cb) => {
        userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
          t.context.log({
            message: 'unable to get auth token',
            error,
          });
        });
      },
    });

    const nonExistentId = new mongoose.Types.ObjectId();
    const nonExistentError = await t.throwsAsync(watchRoom(
      t,
      socket,
      { id: nonExistentId.toString() },
      false,
    ));
    t.is(nonExistentError.message, 'Error: Room does not exist');

    const invalidId = undefined;
    const invalidIdError = await t.throwsAsync(watchRoom(t, socket, { id: invalidId }, false));
    t.is(invalidIdError.message, 'Error: Room does not exist');
  });

  test(`sockets (${name}) can be connected to different nodejs instances and receive events for room:latestState`, async (t) => {
    const { app } = t.context;
    const sideApps = await Promise.all([...Array(3).keys()]
      .map(() => spawnApp(
        t,
        {
          defaultMongoEnv: app.envWithMongo,
          defaultRedisEnv: app.envWithRedis,
        },
      )));
    createOrUpdateSideApps(t, sideApps);

    const { api } = app;
    const {
      userOne, userTwo, userCredOne, userCredTwo, room,
    } = await startTicTacToeRoom(t);
    const apps = [app, ...sideApps];
    const sockets = await Promise.all([...Array(6).keys()]
      .map((_, index) => createSocketAndWatchRoom(
        t,
        apps[index % 4].baseURL,
        room,
        {
          ...config,
          auth: (cb) => {
            const authTokenPromise = (index % 2 === 0)
              ? userCredOne.user.getIdToken() : userCredTwo.user.getIdToken();
            authTokenPromise.then((token) => cb({ token })).catch((error) => {
              t.context.log({
                message: 'unable to get auth token',
                error,
              });
            });
          },
          user: (index % 2 === 0) ? userOne : userTwo,
        },
      )));

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
        emptyObject: {},
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
        emptyObject: {},
      },
    });
  });

  test(`sockets (${name}) gets connect_error if it does not provide auth tokens`, async (t) => {
    const { baseURL } = t.context.app;
    const socket = createSocket(t, baseURL, config);
    const connectError = await waitForNextConnectError(t.context.log, socket);
    t.is(connectError.message, 'First argument to verifyIdToken() must be a Firebase ID token string.');
  });

  test(`sockets (${name}) gets connect_error if providing invalid auth token`, async (t) => {
    const { baseURL } = t.context.app;
    const socket = createSocket(t, baseURL, { ...config, auth: { token: 'invalid-token' } });
    const connectError = await waitForNextConnectError(t.context.log, socket);
    t.is(connectError.message, 'Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.');
  });

  test(`sockets (${name}) get properly disconnected when server is terminating`, async (t) => {
    const { app } = t.context;
    const testApp = await spawnApp(t, {
      defaultMongoEnv: app.envWithMongo,
      defaultRedisEnv: app.envWithRedis,
    });
    const { api, baseURL } = testApp;
    const { mongoClientDatabase } = app;

    const userCredOne = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const socket = createSocket(
      t,
      baseURL,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
      },
    );

    t.true(await waitForConnected(t.context.log, socket));
    await testApp.cleanup();
    t.true(await waitForDisconnected(t.context.log, socket));
    t.is(socket.data.disconnectEvents.length, 1);
    t.is(socket.data.disconnectEvents[0].reason, 'transport close');

    const userSockets = await mongoClientDatabase.collection('usersockets').find({ user: userOne.id }).toArray();
    t.is(userSockets.length, 0);
  });

  test(`sockets (${name}) across several rooms for the same game still get counted as 1 unique player in activePlayerCount`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userCredTwo = await createUserCred();
    const userCredThree = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const userTwo = await createUserAndAssert(t, api, userCredTwo);
    const userThree = await createUserAndAssert(t, api, userCredThree);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);

    // three rooms, two created by userOne, and the last created by userTwo
    const rooms = await Promise.all([
      createRoomAndAssert(t, api, userCredOne, game, userOne),
      createRoomAndAssert(t, api, userCredOne, game, userOne),
      createRoomAndAssert(t, api, userCredTwo, game, userTwo),
      createRoomAndAssert(t, api, userCredThree, game, userThree),
    ]);

    const createSocketPromise = (userCred, user, room) => createSocketAndWatchRoom(t, baseURL, room,
      {
        ...config,
        auth: (cb) => userCred.user.getIdToken().then((token) => cb({ token })).catch(((error) => {
          t.context.log({
            message: 'unable to get auth token',
            error,
          });
        })),
        user,
      });

    // create 6 sockets per room (6 sockets * 4 rooms = 24 total sockets)
    // testing high concurrent sockets to make sure we are free of race conditions in our
    // transaction handling
    const sockets = await Promise.all(rooms
      .reduce((curSocketPromises, room) => [
        ...curSocketPromises,
        createSocketPromise(userCredOne, userOne, room),
        createSocketPromise(userCredOne, userOne, room),
        createSocketPromise(userCredOne, userOne, room),
        createSocketPromise(userCredTwo, userTwo, room),
        createSocketPromise(userCredTwo, userTwo, room),
        createSocketPromise(userCredThree, userThree, room),
      ], []));

    await assertActivePlayerCount(t, game.id, 3);
    sockets.forEach((socket) => socket.disconnect());
    await waitFor(t, async () => {
      const count = await getActivePlayerCountAndAssert(t, game.id);
      if (count === 0) {
        return true;
      }
      t.context.log({ gameId: game.id, count });
      throw new Error('Active player count never went to 0');
    });
    const { mongoClientDatabase } = t.context.app;
    const userSockets = await mongoClientDatabase.collection('usersockets').find({ game: game.id }).toArray();
    t.is(userSockets.length, 0);
  });

  test(`sockets (${name}) disconnected kicks player if they don't have a socket connection after 30 seconds`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);
    const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
    const socket = await createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user: userOne,
      },
    );

    t.context.log(`disconnected socket at: ${new Date().toISOString()}`);
    socket.disconnect();

    // user should still be in room right before the disconnectTimeout
    await sleep(rightBeforeDisconnectTimeoutMs);
    const roomRightBeforeDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right before disconnect timeout: ${new Date().toISOString()}`, roomRightBeforeDisconnectTimeout);
    t.deepEqual(roomRightBeforeDisconnectTimeout, room);

    // user should no longer be in room after disconnectTimeout
    await sleep(timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs);
    const roomRightAfterDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right after disconnect timeout: ${new Date().toISOString()}`, roomRightAfterDisconnectTimeout);
    t.is(roomRightAfterDisconnectTimeout.id, room.id);
    t.is(roomRightAfterDisconnectTimeout.latestState.version, room.latestState.version + 1);
    t.is(roomRightAfterDisconnectTimeout.players.length, 0);
  });

  test(`sockets (${name}) with other players notifies clients of user disconnect timeout`, async (t) => {
    const { baseURL } = t.context.app;
    const {
      room, userCredOne, userCredTwo, userOne, userTwo,
    } = await startTicTacToeRoom(t);
    const createTempSocket = (userCred, user) => createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCred.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user,
      },
    );
    const userOneSocket = await createTempSocket(userCredOne, userOne);
    const userTwoSocket = await createTempSocket(userCredTwo, userTwo);
    t.context.log(`disconnected socket at: ${new Date().toISOString()}`);
    userOneSocket.disconnect();

    // user should still be in room right before the disconnectTimeout
    await sleep(rightBeforeDisconnectTimeoutMs);
    const roomRightBeforeDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right before disconnect timeout: ${new Date().toISOString()}`, roomRightBeforeDisconnectTimeout);
    t.deepEqual(roomRightBeforeDisconnectTimeout, {
      ...room,
      game: { ...room.game, activePlayerCount: 1 },
    });

    // user should no longer be in room after disconnectTimeout
    await sleep(timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs);
    const roomRightAfterDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right after disconnect timeout: ${new Date().toISOString()}`, roomRightAfterDisconnectTimeout);
    t.is(roomRightAfterDisconnectTimeout.id, room.id);
    t.is(roomRightAfterDisconnectTimeout.latestState.version, room.latestState.version + 1);
    t.is(roomRightAfterDisconnectTimeout.players.length, 0);
    await assertNextLatestState(t, userTwoSocket, {
      finished: true,
      joinable: false,
      players: [],
      version: room.latestState.version + 1,
      state: {
        board: [[null, null, null], [null, null, null], [null, null, null]],
        plrToMoveIndex: 0,
        status: 'endGame',
        winner: getPublicUserFromUser(userTwo),
        emptyObject: {},
      },
    });
  });

  test(`sockets (${name}) multiple disconnections kicks player if they don't have a socket connection after 30 seconds`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);
    const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
    const sockets = await Promise.all([...Array(3).keys()].map(() => createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user: userOne,
      },
    )));

    t.context.log(`disconnecting sockets at: ${new Date().toISOString()}`);
    sockets.forEach((socket) => socket.disconnect());

    // user should still be in room right before the disconnectTimeout
    await sleep(rightBeforeDisconnectTimeoutMs);
    const roomRightBeforeDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right before disconnect timeout: ${new Date().toISOString()}`, roomRightBeforeDisconnectTimeout);
    t.deepEqual(roomRightBeforeDisconnectTimeout, room);

    // user should no longer be in room after disconnectTimeout
    await sleep(timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs);
    const roomRightAfterDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right after disconnect timeout: ${new Date().toISOString()}`, roomRightAfterDisconnectTimeout);
    t.is(roomRightAfterDisconnectTimeout.id, room.id);
    t.is(roomRightAfterDisconnectTimeout.latestState.version, room.latestState.version + 1);
    t.is(roomRightAfterDisconnectTimeout.players.length, 0);
  });

  test(`sockets (${name}) disconnected does not kick player if they have a socket connection after 30 seconds`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);
    const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
    const createNewSocket = () => createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user: userOne,
      },
    );
    const socket = await createNewSocket();
    const roomAfterFirstSocket = await getRoomAndAssert(t, room.id);

    t.context.log(`disconnected socket at: ${new Date().toISOString()}`);
    socket.disconnect();

    // user should still be in room right before the disconnectTimeout
    await sleep(rightBeforeDisconnectTimeoutMs);
    const roomRightBeforeDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right before disconnect timeout: ${new Date().toISOString()}`, roomRightBeforeDisconnectTimeout);
    t.deepEqual(roomRightBeforeDisconnectTimeout, room);

    // user reconnects with new socket before timeout
    await createNewSocket();

    // user should still in room after disconnectTimeout because we just connected a new socket
    await sleep(timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs);
    const roomRightAfterDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right after disconnect timeout: ${new Date().toISOString()}`, roomRightAfterDisconnectTimeout);
    t.deepEqual(roomRightAfterDisconnectTimeout, roomAfterFirstSocket);
  });

  test(`sockets (${name}) disconnected does not kick player if room is private`, async (t) => {
    const { api, baseURL } = t.context.app;
    const userCredOne = await createUserCred();
    const userOne = await createUserAndAssert(t, api, userCredOne);
    const game = await createGameAndAssert(t, api, userCredOne, userOne);
    const room = await createRoomAndAssert(t, api, userCredOne, game, userOne, true);
    const socket = await createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user: userOne,
      },
    );

    t.context.log(`disconnected socket at: ${new Date().toISOString()}`);
    socket.disconnect();

    // user should still be in room right before the disconnectTimeout
    await sleep(rightBeforeDisconnectTimeoutMs);
    const roomRightBeforeDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right before disconnect timeout: ${new Date().toISOString()}`, roomRightBeforeDisconnectTimeout);
    t.deepEqual(roomRightBeforeDisconnectTimeout, room);

    // user should no longer be in room after disconnectTimeout
    await sleep(timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs);
    const roomRightAfterDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right after disconnect timeout: ${new Date().toISOString()}`, roomRightAfterDisconnectTimeout);
    t.deepEqual(roomRightAfterDisconnectTimeout, room);
  });

  test(`sockets (${name}) disconnected does not kick player if room is finished`, async (t) => {
    const { api, baseURL } = t.context.app;
    const {
      userCredOne, userOne, userCredTwo, room,
    } = await startTicTacToeRoom(t);

    // quit room which will force the room to be in finished state
    await api.post(`/room/${room.id}/quit`, undefined,
      { headers: { authorization: await userCredTwo.user.getIdToken() } });
    const roomAfterQuit = await getRoomAndAssert(t, room.id);

    const socket = await createSocketAndWatchRoom(
      t,
      baseURL,
      room,
      {
        ...config,
        auth: (cb) => {
          userCredOne.user.getIdToken().then((token) => cb({ token })).catch((error) => {
            t.context.log({
              message: 'unable to get auth token',
              error,
            });
          });
        },
        user: userOne,
      },
    );
    t.context.log(`disconnected socket at: ${new Date().toISOString()}`);
    socket.disconnect();

    // user should still be in room right before the disconnectTimeout
    await sleep(rightBeforeDisconnectTimeoutMs);
    const roomRightBeforeDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right before disconnect timeout: ${new Date().toISOString()}`, roomRightBeforeDisconnectTimeout);
    t.deepEqual(roomRightBeforeDisconnectTimeout, roomAfterQuit);

    // user should no longer be in room after disconnectTimeout
    await sleep(timeBetweenRightBeforeAndRightAfterDisconnectTimeoutMs);
    const roomRightAfterDisconnectTimeout = await getRoomAndAssert(t, room.id);
    t.context.log(`checking room right after disconnect timeout: ${new Date().toISOString()}`, roomRightAfterDisconnectTimeout);
    t.deepEqual(roomRightAfterDisconnectTimeout, roomAfterQuit);
  });
});
