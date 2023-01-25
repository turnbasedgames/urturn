const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const { createUserCred } = require('./firebase');

function getPublicUserFromUser(user) {
  return {
    id: user.id,
    username: user.username,
  };
}

async function getRoomAndAssert(t, roomId) {
  const { api } = t.context.app;
  const { status, data: { room } } = await api.get(
    `/room/${roomId}`,
  );
  t.is(status, StatusCodes.OK);
  return room;
}

async function getGame(api, gameId) {
  const { data: { game } } = await api.get(`/game/${gameId}`);
  return game;
}

async function createGameAndAssert(t, api, userCred, user, gameOptionalInfo = {}) {
  const name = gameOptionalInfo.name ?? `integration-tests-${uuidv4()}`;
  const description = gameOptionalInfo.description ?? 'test description';

  const gameRaw = {
    name,
    description,
    commitSHA: 'published-test-app', // check the branch for later commits: published-test-app,
    githubURL: 'https://github.com/turnbasedgames/urturn',
  };

  if (gameOptionalInfo.customURL) {
    gameRaw.customURL = gameOptionalInfo.customURL;
  }

  const authToken = await userCred.user.getIdToken();
  const { data: { game }, status } = await api.post('/game', gameRaw, { headers: { authorization: authToken } });

  t.is(status, StatusCodes.CREATED);
  const { urbux, ...publicUser } = user;
  t.deepEqual(game.creator, publicUser);
  t.is(game.activePlayerCount, 0);
  Object.keys(gameRaw).forEach((key) => {
    t.is(gameRaw[key], game[key]);
  });
  if (gameRaw.customURL == null) {
    // custom url defaults to the game id
    t.is(game.customURL, game.id);
  }
  return game;
}

async function createUserAndAssert(t, api, userCred) {
  const authToken = await userCred.user.getIdToken();
  const { data: { user }, status } = await api.post('/user', {}, { headers: { authorization: authToken } });
  t.is(status, StatusCodes.CREATED);
  t.is(user.firebaseId, userCred.user.uid);
  t.is(user.urbux, 0);
  return user;
}

async function deleteUserAndAssert(t, api, userCred) {
  if (userCred.user == null) {
    return;
  }
  const authToken = await userCred.user.getIdToken();
  const { status } = await api.delete('/user', { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
}

async function cleanupTestUsers(t) {
  const { createdUsers, app: { api } } = t.context;
  return Promise.all(createdUsers.map((cred) => deleteUserAndAssert(t, api, cred)));
}

async function createRoomAndAssert(t, api, userCred, game, user, makePrivate = false) {
  const authToken = await userCred.user.getIdToken();
  const { data: { room }, status } = await api.put('/room',
    { game: game.id, private: makePrivate },
    { headers: { authorization: authToken } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(room.game, {
    ...game,
    // don't assert on playCount and updatedAt, as they are non deterministically modified
    playCount: room.game.playCount,
    updatedAt: room.game.updatedAt,
  });
  t.is(room.joinable, true);
  t.is(room.private, makePrivate);
  t.deepEqual(room.players, [user].map(getPublicUserFromUser));
  t.deepEqual(room.latestState.state, {
    last: {
      finished: false,
      joinable: true,
      players: [getPublicUserFromUser(user)],
      roomStartContext: {
        private: makePrivate,
      },
      state: {
        message: 'room start!',
      },
      version: 0,
    },
    message: `${user.username} joined!`,
  });
  t.deepEqual(room.roomStartContext, { private: makePrivate });
  return room;
}

async function startTicTacToeRoom(t) {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  const authTokenTwo = await userCredTwo.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const { data: { room: resRoom }, status } = await api.put('/room', { game: game.id },
    { headers: { authorization: authTokenTwo } });
  t.is(status, StatusCodes.OK);
  // a second PUT /room request should add the player to the previous joinable room that was just
  // created
  t.is(resRoom.id, room.id);
  t.deepEqual(resRoom.game, {
    ...game,
    // don't assert behaviors of playCount, other tests will assert these values
    updatedAt: resRoom.game.updatedAt,
    playCount: resRoom.game.playCount,
  });
  t.is(resRoom.joinable, true);
  t.deepEqual(resRoom.players, [userOne, userTwo].map(getPublicUserFromUser));
  t.deepEqual(resRoom.latestState.state, {
    last: {
      finished: false,
      joinable: true,
      players: resRoom.players,
      roomStartContext: {
        private: false,
      },
      version: 0,
      state: room.latestState.state,
    },
    message: `${userTwo.username} joined!`,
  });
  return {
    userOne, userTwo, userCredOne, userCredTwo, game, room: resRoom,
  };
}

async function getServiceInstanceAndAssert(t, api) {
  const { data: { serviceInstance }, status } = await api.get('/instance');
  t.is(status, StatusCodes.OK);
  return serviceInstance;
}

module.exports = {
  getServiceInstanceAndAssert,
  getPublicUserFromUser,
  createGameAndAssert,
  createRoomAndAssert,
  createUserAndAssert,
  startTicTacToeRoom,
  getRoomAndAssert,
  cleanupTestUsers,
  getGame,
};
