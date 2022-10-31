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

async function createGameAndAssert(t, api, userCred, user, gameOptionalInfo = {}) {
  // TODO: we should switch from using tictactoe to runner/test_app backend where we
  // have more control over the backend behavior. We can force trigger errors, or other behaviors
  const name = gameOptionalInfo.name ?? `integration-tests-${uuidv4()}`;
  const description = gameOptionalInfo.description ?? 'test description';

  const gameRaw = {
    name,
    description,
    commitSHA: '0870320e312f711d20e8c8078399d8a6aceb6d46',
    githubURL: 'https://github.com/turnbasedgames/tictactoe',
  };
  const authToken = await userCred.user.getIdToken();
  const { data: { game }, status } = await api.post('/game', gameRaw, { headers: { authorization: authToken } });
  t.is(status, StatusCodes.CREATED);
  const { urbux, ...publicUser } = user;
  t.deepEqual(game.creator, publicUser);
  t.is(game.activePlayerCount, 0);
  Object.keys(gameRaw).forEach((key) => {
    t.is(gameRaw[key], game[key]);
  });
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
  t.deepEqual(room.game, game);
  t.is(room.joinable, true);
  t.is(room.private, makePrivate);
  t.deepEqual(room.players, [user].map(getPublicUserFromUser));
  t.deepEqual(room.latestState.state, {
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
    status: 'preGame',
    winner: null,
    emptyObject: {},
  });
  return room;
}

async function startTicTacToeRoom(t) {
  const { api } = t.context.app;
  const userCredOne = await createUserCred();
  const userCredTwo = await createUserCred();
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
  t.deepEqual(resRoom.game, game);
  t.is(resRoom.joinable, false);
  t.deepEqual(resRoom.players, [userOne, userTwo].map(getPublicUserFromUser));
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
    plrToMoveIndex: 0,
    status: 'inGame',
    winner: null,
    emptyObject: {},
  });
  return {
    userOne, userTwo, userCredOne, userCredTwo, game, room: resRoom,
  };
}

module.exports = {
  getPublicUserFromUser,
  createGameAndAssert,
  createRoomAndAssert,
  createUserAndAssert,
  cleanupTestUsers,
  startTicTacToeRoom,
  getRoomAndAssert,
};
