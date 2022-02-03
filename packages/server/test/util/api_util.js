const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const { createUserCred } = require('./firebase');

async function createGameAndAssert(t, api, userCred, user) {
  const gameRaw = {
    name: `integration-tests-${uuidv4()}`,
    description: 'test description',
    commitSHA: '0f768bc1d74e804b73d81f290f14c86721c9cc90',
    githubURL: 'https://github.com/turnbasedgames/tictactoe',
  };
  const authToken = await userCred.user.getIdToken();
  const { data: { game }, status } = await api.post('/game', gameRaw, { headers: { authorization: authToken } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(game.creator, user);
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
  return user;
}

async function createRoomAndAssert(t, api, userCred, game, user) {
  const authToken = await userCred.user.getIdToken();
  const { data: { room }, status } = await api.post('/room', { game: game.id }, { headers: { authorization: authToken } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(room.game, game);
  t.is(room.joinable, true);
  t.deepEqual(room.players, [user]);
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
    state: 'NOT_STARTED',
    winner: null,
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
  const { data: { room: resRoom }, status } = await api.post(`/room/${room.id}/join`, {},
    { headers: { authorization: authTokenTwo } });
  t.is(status, StatusCodes.OK);
  t.deepEqual(resRoom.game, game);
  t.is(resRoom.joinable, false);
  t.deepEqual(resRoom.players, [userOne, userTwo]);
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
    state: 'IN_GAME',
    winner: null,
  });
  return {
    userOne, userTwo, userCredOne, userCredTwo, game, room: resRoom,
  };
}

module.exports = {
  createGameAndAssert, createRoomAndAssert, createUserAndAssert, startTicTacToeRoom,
};
