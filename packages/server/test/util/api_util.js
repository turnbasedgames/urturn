const { StatusCodes } = require('http-status-codes');

async function createGameAndAssert(t, api, userCred, user) {
  const gameRaw = {
    name: 'test name',
    description: 'test description',
    commitSHA: '7d1a6069988cdf799946ed40a1f9adeb0cb471ff',
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

async function createRoomAndAssert(t, api, userCred, game, leader) {
  const authToken = await userCred.user.getIdToken();
  const { data: { room }, status } = await api.post('/room', { game: game.id }, { headers: { authorization: authToken } });
  t.is(status, StatusCodes.CREATED);
  t.deepEqual(room.leader, leader);
  t.deepEqual(room.game, game);
  t.deepEqual(room.state, {
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
    plrs: [
      room.leader.id,
    ],
    state: 'NOT_STARTED',
    winner: null,
  });
  return room;
}

module.exports = { createGameAndAssert, createRoomAndAssert, createUserAndAssert };
