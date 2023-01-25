const test = require('ava');
const { StatusCodes } = require('http-status-codes');
const { Types } = require('mongoose');

const { spawnApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const {
  getGame,
  getPublicUserFromUser,
  createUserAndAssert,
  createGameAndAssert,
  createRoomAndAssert,
  startTestAppRoom,
  getRoomAndAssert,
} = require('../util/api_util');
const { createOrUpdateSideApps, setupTestFileLogContext } = require('../util/util');
const { setupTestBeforeAfterHooks } = require('../util/app');

async function testOperationOnFinishedRoom(t, operation) {
  const { userCredOne, userCredTwo, room } = await startTestAppRoom(t);
  const { api } = t.context.app;
  const authTokenOne = await userCredOne.user.getIdToken();
  const authTokenTwo = await userCredTwo.user.getIdToken();

  // Force the room to be finished
  // test-app backend allows us to hook into metadata fields and modify on move
  await api.post(`/room/${room.id}/move`, { finished: true },
    { headers: { authorization: authTokenOne } });
  const { response: { status, data: { message, name } } } = await t.throwsAsync(api.post(`/room/${room.id}/${operation}`, undefined,
    { headers: { authorization: authTokenTwo } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.is(name, 'RoomFinished');
  t.is(message, `${room.id} is no longer mutable because it is finished!`);
}

setupTestBeforeAfterHooks(test);

setupTestFileLogContext(test);

test('GET /room returns list of rooms', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const authToken = await userCred.user.getIdToken();

  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  await createRoomAndAssert(t, api, userCred, game, user);
  const { data: { rooms }, status } = await api.get(
    '/room', { params: { gameId: game.id, privateRooms: false }, headers: { authorization: authToken } },
  );
  t.is(status, StatusCodes.OK);
  t.assert(rooms.length > 0);
});

test('GET /room does not return private room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const authToken = await userCred.user.getIdToken();

  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  await createRoomAndAssert(t, api, userCred, game, user, true);
  const { data: { rooms }, status } = await api.get(
    '/room', { params: { gameId: game.id, privateRooms: false }, headers: { authorization: authToken } },
  );
  t.is(status, StatusCodes.OK);
  t.is(rooms.length, 0);
});

test('GET /room returns private room(s) for users that are querying there own data with containsPlayer', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const authToken = await userCred.user.getIdToken();

  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  await createRoomAndAssert(t, api, userCred, game, user, true);
  const { data: { rooms }, status } = await api.get(
    '/room', { params: { gameId: game.id, containsPlayer: user.id }, headers: { authorization: authToken } },
  );

  t.is(status, StatusCodes.OK);
  t.is(rooms.length, 1);
});

test('GET /room returns private room(s) for users that are querying there own data with containsInactivePlayer', async (t) => {
  const { api } = t.context.app;
  const {
    userTwo, userCredTwo, room, game,
  } = await startTestAppRoom(t);
  const authTokenTwo = await userCredTwo.user.getIdToken();

  // only user two attempts to quit room
  await api.post(`/room/${room.id}/quit`, {}, { headers: { authorization: authTokenTwo } });

  const { data: { rooms }, status } = await api.get(
    '/room', { params: { gameId: game.id, containsInactivePlayer: userTwo.id }, headers: { authorization: authTokenTwo } },
  );

  t.is(status, StatusCodes.OK);
  t.is(rooms.length, 1);
});

test('GET /room throws error if private query param is true and containsPlayer is not specified', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const authToken = await userCred.user.getIdToken();

  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  await createRoomAndAssert(t, api, userCred, game, user, true);
  const { response: { status } } = await t.throwsAsync(api.get(
    '/room', { params: { gameId: game.id, privateRooms: true }, headers: { authorization: authToken } },
  ));

  t.is(status, StatusCodes.BAD_REQUEST);
});

test('GET /room throws error if containsPlayer does not match user.id and private rooms are requested', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const authTokenOne = await userCredOne.user.getIdToken();

  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  await createRoomAndAssert(t, api, userCredOne, game, userOne, true);
  const { response: { status } } = await t.throwsAsync(api.get(
    '/room', { params: { gameId: game.id, containsPlayer: userTwo.id, privateRooms: true }, headers: { authorization: authTokenOne } },
  ));

  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /room throws error if containsInactivePlayer does not match user.id and private rooms are requested', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const authTokenOne = await userCredOne.user.getIdToken();

  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  await createRoomAndAssert(t, api, userCredOne, game, userOne, true);
  const { response: { status } } = await t.throwsAsync(api.get(
    '/room', { params: { gameId: game.id, containsInactivePlayer: userTwo.id, privateRooms: true }, headers: { authorization: authTokenOne } },
  ));

  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /room throws error if containsPlayer does not match user.id and private rooms are not set', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const authTokenOne = await userCredOne.user.getIdToken();

  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  await createRoomAndAssert(t, api, userCredOne, game, userOne, true);
  const { response: { status } } = await t.throwsAsync(api.get(
    '/room', { params: { gameId: game.id, containsPlayer: userTwo.id }, headers: { authorization: authTokenOne } },
  ));

  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /room throws error if containsInactivePlayer does not match user.id and private rooms are not set', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const authTokenOne = await userCredOne.user.getIdToken();

  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  await createRoomAndAssert(t, api, userCredOne, game, userOne, true);
  const { response: { status } } = await t.throwsAsync(api.get(
    '/room', { params: { gameId: game.id, containsPlayer: userTwo.id }, headers: { authorization: authTokenOne } },
  ));

  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /room supports query by "joinable", "finished", "containsPlayer", and "omitPlayer"', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const authTokenOne = await userCredOne.user.getIdToken();
  const authTokenTwo = await userCredTwo.user.getIdToken();
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const roomOmitted = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  await api.post(`/room/${roomOmitted.id}/join`, {}, { headers: { authorization: authTokenTwo } });
  const { data: { rooms }, status } = await api.get(
    '/room', {
      params: {
        gameId: game.id,
        joinable: true,
        finished: false,
        containsPlayer: userOne.id,
        omitPlayer: userTwo.id,
      },
      headers: {
        authorization: authTokenOne,
      },
    },
  );
  t.is(status, StatusCodes.OK);
  t.assert(rooms.length === 1);
  t.assert(rooms[0].id === room.id);
});

test('GET /room supports query by "containsInactivePlayer"', async (t) => {
  const { api } = t.context.app;
  const {
    userTwo, userCredTwo, room, game,
  } = await startTestAppRoom(t);
  const authTokenTwo = await userCredTwo.user.getIdToken();

  // only user two attempts to quit room, but because this triggers a finished room
  // user one also becomes an inactive player
  await api.post(`/room/${room.id}/quit`, {}, { headers: { authorization: authTokenTwo } });

  const { data: { rooms: roomsUserOneQuit }, status: statusUserOne } = await api.get(
    '/room', {
      params: {
        gameId: game.id, containsInactivePlayer: userTwo.id, privateRooms: false,
      },
      headers: {
        authorization: authTokenTwo,
      },
    },
  );
  t.is(statusUserOne, StatusCodes.OK);
  t.assert(roomsUserOneQuit.length === 1);
  t.assert(roomsUserOneQuit[0].id === room.id);

  const { data: { rooms: roomsUserTwoQuit }, status: statusUserTwo } = await api.get(
    '/room', {
      params: {
        gameId: game.id, containsInactivePlayer: userTwo.id, privateRooms: false,
      },
      headers: {
        authorization: authTokenTwo,
      },
    },
  );
  t.is(statusUserTwo, StatusCodes.OK);
  t.assert(roomsUserTwoQuit.length === 1);
  t.assert(roomsUserTwoQuit[0].id === room.id);
});

test('PUT /room fails if joinable is provided', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();

  const game = await createGameAndAssert(t, api, userCred, user);
  const { response } = await t.throwsAsync(
    api.put('/room', {
      game: game.id,
      joinable: false,
    }, { headers: { authorization: authToken } }),
  );

  t.is(response.status, StatusCodes.BAD_REQUEST);
});

test('PUT /room fails if finished is provided', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();

  const game = await createGameAndAssert(t, api, userCred, user);
  const { response } = await t.throwsAsync(
    api.put('/room', {
      game: game.id,
      finished: false,
    }, { headers: { authorization: authToken } }),
  );

  t.is(response.status, StatusCodes.BAD_REQUEST);
});

test('PUT /room fails if latestState is provided', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();

  const game = await createGameAndAssert(t, api, userCred, user);
  const { response } = await t.throwsAsync(
    api.put('/room', {
      game: game.id,
      latestState: 'this is the latest state',
    }, { headers: { authorization: authToken } }),
  );

  t.is(response.status, StatusCodes.BAD_REQUEST);
});

test('PUT /room returns \'room.game must exist\' if no room', async (t) => {
  const { api } = t.context.app;
  const gameId = Types.ObjectId(); // this game does not exist in database

  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);

  const authToken = await userCred.user.getIdToken();
  const privateValues = [true, false, undefined];
  await Promise.all(privateValues.map(async (privateValue) => {
    const { response: { status, data } } = await t.throwsAsync(
      api.put('/room',
        { game: gameId, private: privateValue },
        { headers: { authorization: authToken } }),
    );
    t.is(status, StatusCodes.BAD_REQUEST);
    t.is(data.message, 'game must exist!');
  }));
});

test('PUT /room creates a room for the user if a private field is specified', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const gameBeforeCreateRoom = await getGame(api, game.id);
  await createRoomAndAssert(t, api, userCred, game, user, true);
  const gameAfterCreateRoom = await getGame(api, game.id);
  t.is(gameAfterCreateRoom.playCount, gameBeforeCreateRoom.playCount + 1);
});

test('PUT /room creates a room for the user if user is not able to join any rooms including private rooms', async (t) => {
  const { api } = t.context.app;

  // user1 is a new player, looking to have some fun and joins and queues up to play
  const user1Cred = await createUserCred(t);
  const user1 = await createUserAndAssert(t, api, user1Cred);

  // user2 represents a completely separate user minding their business and creating private rooms
  // user2 does not know about user1
  const user2Cred = await createUserCred(t);
  const user2 = await createUserAndAssert(t, api, user2Cred);

  const game = await createGameAndAssert(t, api, user1Cred, user1);
  // create several private rooms first
  await createRoomAndAssert(t, api, user2Cred, game, user2, true);
  await createRoomAndAssert(t, api, user2Cred, game, user2, true);
  await createRoomAndAssert(t, api, user2Cred, game, user2, true);

  // user should not queue into any of those rooms
  const room1 = await createRoomAndAssert(t, api, user1Cred, game, user1);

  // user can queue up into multiple rooms
  const room2 = await createRoomAndAssert(t, api, user1Cred, game, user1);

  // rooms should be different
  t.not(room1.id, room2.id);
});

test('PUT /room creates a private room for a user even if they have created a public room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const createdRoom = await createRoomAndAssert(t, api, userCred, game, user, false);

  const authToken = await userCred.user.getIdToken();
  const { status, data: { room } } = await api.put('/room', {
    game: game.id,
    private: true,
  }, { headers: { authorization: authToken } });

  t.is(status, StatusCodes.CREATED);
  t.true(room.id !== createdRoom.id);
});

test('PUT /room joins a user to a room if there exist a room for the user to join', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const userOne = await createUserAndAssert(t, api, userCredOne);
  await createUserAndAssert(t, api, userCredTwo);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  await createRoomAndAssert(t, api, userCredOne, game, userOne, false);

  const authTokenTwo = await userCredTwo.user.getIdToken();
  const { status, data: { room } } = await api.put('/room', {
    game: game.id,
  }, { headers: { authorization: authTokenTwo } });

  t.is(status, StatusCodes.OK);
  t.is(room.players.length, 2);
});

test('POST /room/:id/reset with an invalid roomId a 400', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);
  const {
    response: {
      status,
      data: { validation: { params: { message } } },
    },
  } = await t.throwsAsync(api.post('/room/notvalidroomid/reset', undefined, {
    headers: { authorization: await userCred.user.getIdToken() },
  }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(message, 'Error code "Invalid ObjectID" is not defined, your custom type is missing the correct messages definition');
});

test('POST /room/:id/reset on non-existent room provides a 400', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  await createUserAndAssert(t, api, userCred);
  const nonExistentObjId = new Types.ObjectId();
  const {
    response: { status, data: { message } },
  } = await t.throwsAsync(api.post(
    `/room/${nonExistentObjId.toString()}/reset`,
    undefined,
    { headers: { authorization: await userCred.user.getIdToken() } },
  ));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(message, 'room must exist!');
});

test('POST /room/:id/reset on a room with non-existent game provides a 400', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user, true);

  // delete game
  const { status: statusDel } = await api.delete(`/game/${game.id}`, { headers: { authorization: await userCred.user.getIdToken() } });
  t.is(statusDel, StatusCodes.OK);

  const {
    response: { status, data: { message } },
  } = await t.throwsAsync(api.post(
    `/room/${room.id}/reset`,
    undefined,
    { headers: { authorization: await userCred.user.getIdToken() } },
  ));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(message, 'game must exist!');
});

test('POST /room/:id/reset on a room not finished provides a 400', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user, true);

  const {
    response: { status, data: { message } },
  } = await t.throwsAsync(api.post(
    `/room/${room.id}/reset`,
    undefined,
    { headers: { authorization: await userCred.user.getIdToken() } },
  ));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(message, `Room ${room.id} is not finished!`);
});

test('POST /room/:id/reset on a room not private provides a 400', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user, false);

  // finish the game
  const moveRes = await api.post(`/room/${room.id}/move`, { finished: true },
    { headers: { authorization: await userCred.user.getIdToken() } });
  t.is(moveRes.status, StatusCodes.OK);

  const {
    response: { status, data: { message } },
  } = await t.throwsAsync(api.post(
    `/room/${room.id}/reset`,
    undefined,
    { headers: { authorization: await userCred.user.getIdToken() } },
  ));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(message, `Room ${room.id} is not private!`);
});

test('POST /room/:id/reset on a room that does not contain the user provides a 400', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const evilUserCred = await createUserCred(t);
  const evilUser = await createUserAndAssert(t, api, evilUserCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user, true);

  // finish the game
  const moveRes = await api.post(`/room/${room.id}/move`, { finished: true },
    { headers: { authorization: await userCred.user.getIdToken() } });
  t.is(moveRes.status, StatusCodes.OK);

  const {
    response: { status, data: { message } },
  } = await t.throwsAsync(api.post(
    `/room/${room.id}/reset`,
    undefined,
    { headers: { authorization: await evilUserCred.user.getIdToken() } },
  ));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(message, `You (${evilUser.username}) are not in the room! You are spectating.`);
});

test('POST /room/:id/reset resets the private room to an initial state', async (t) => {
  const { context: { app: { api } } } = t;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);
  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user, true);

  // finish the game
  const moveRes = await api.post(`/room/${room.id}/move`, { finished: true },
    { headers: { authorization: await userCred.user.getIdToken() } });
  t.is(moveRes.status, StatusCodes.OK);

  const { status, data: { room: roomResult } } = await api.post(
    `/room/${room.id}/reset`,
    undefined,
    { headers: { authorization: await userCred.user.getIdToken() } },
  );
  t.is(status, StatusCodes.OK);
  t.is(roomResult.id, room.id);
  t.is(roomResult.game.id, game.id);
  t.deepEqual(roomResult.players, room.players);
  t.is(roomResult.joinable, true);
  t.is(roomResult.finished, false);
  t.is(roomResult.latestState.state.message, `${user.username} joined!`);
  t.is(roomResult.latestState.version, room.latestState.version + 2);
  t.is(roomResult.private, true);
  t.deepEqual(roomResult.roomStartContext, { private: true });
});

test('POST /room/:id/join joins a game', async (t) => {
  await startTestAppRoom(t);
});

test('POST /room/:id/join on a non joinable room provides a 400', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userOne = await createUserAndAssert(t, api, userCredOne);

  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const createdRoom = await createRoomAndAssert(t, api, userCredOne, game, userOne, false);

  // make a move to make the room not joinable (test-app logic)
  const authTokenOne = await userCredOne.user.getIdToken();
  const moveRes = await api.post(`/room/${createdRoom.id}/move`, { joinable: false },
    { headers: { authorization: authTokenOne } });
  t.is(moveRes.status, StatusCodes.OK);

  const userCredTwo = await createUserCred(t);
  await createUserAndAssert(t, api, userCredTwo);

  const authTokenTwo = await userCredTwo.user.getIdToken();
  const { response: { status, data: { message, name } } } = await t.throwsAsync(api.post(`/room/${createdRoom.id}/join`, undefined, { headers: { authorization: authTokenTwo } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.is(name, 'RoomNotJoinable');
  t.is(message, `${createdRoom.id} is not joinable!`);
});

test('POST /room/:id/join on a room a player already joined provides a 400', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const authTokenOne = await userCredOne.user.getIdToken();

  const {
    response: { status, data: { message, name } },
  } = await t.throwsAsync(api.post(
    `/room/${room.id}/join`,
    undefined,
    {
      headers: { authorization: authTokenOne },
    },
  ));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.is(name, 'UserAlreadyInRoom');
  t.is(message, `${userOne.id}: ${userOne.username} is already in room ${room.id}!`);
});

test('POST /room/:id/join on a finished room throws an error', async (t) => {
  await testOperationOnFinishedRoom(t, 'join');
});

test('POST /room/:id/move invokes creator backend to modify the game state', async (t) => {
  const { userCredOne, userOne, room } = await startTestAppRoom(t);
  const { api } = t.context.app;
  const authToken = await userCredOne.user.getIdToken();

  // make move
  const { status } = await api.post(`/room/${room.id}/move`, {
    x: 0,
    y: 0,
    testString: 'hello world',
    testNested: { a: 'billy' },
    emptyObj: {}, // make sure empty objects don't get stripped by mongoose
  },
  { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
  const { latestState: { state }, joinable, players } = await getRoomAndAssert(t, room.id);
  t.deepEqual(
    {
      last: state.last,
      move: {
        x: 0,
        y: 0,
        testString: 'hello world',
        testNested: { a: 'billy' },
        emptyObj: {},
      },
      message: `${userOne.username} made move!`,
    },
    state,
  );
  t.is(joinable, room.joinable);
  t.deepEqual(players, room.players);
});

test('POST /room/:id/move provides error if user code throws an error', async (t) => {
  const { userCredTwo, room } = await startTestAppRoom(t);

  const { api } = t.context.app;

  const authToken = await userCredTwo.user.getIdToken();
  const { response: { status, data } } = await t.throwsAsync(api.post(`/room/${room.id}/move`,
    { error: 'force error in test-app' },
    { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(data, {
    creatorError: {
      message: 'force error in test-app',
      name: 'Error',
    },
    name: 'CreatorError',
  });
});

test('POST /room/:id/move provides error if user tries to make move when not in the room', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
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

test('POST /room/:id/move provides error if database fails', async (t) => {
  // create a separate app
  const customApp = await spawnApp(t, { forceCreatePersistentDependencies: true });
  createOrUpdateSideApps(t, [customApp]);
  const { api, cleanupMongoDB } = customApp;
  const { userCredOne, room } = await startTestAppRoom({
    ...t,
    context: {
      ...t.context,
      app: customApp,
    },
  });

  const authToken = await userCredOne.user.getIdToken();

  // forces any db transactions on the customApp to fail because db is no longer running
  await cleanupMongoDB();
  const { response: { status } } = await t.throwsAsync(api.post(`/room/${room.id}/move`,
    { x: 0, y: 0 },
    { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.INTERNAL_SERVER_ERROR);
});

test('POST /room/:id/move on a finished room throws an error', async (t) => {
  await testOperationOnFinishedRoom(t, 'move');
});

test('POST /room/:id/quit user is no longer in the room, and is in inactivePlayers list', async (t) => {
  const {
    userOne, userTwo, userCredOne, room,
  } = await startTestAppRoom(t);

  const { api } = t.context.app;
  const authToken = await userCredOne.user.getIdToken();

  // quit room
  const { status } = await api.post(`/room/${room.id}/quit`, undefined,
    { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
  const {
    joinable, players, inactivePlayers, finished,
  } = await getRoomAndAssert(t, room.id);
  t.is(joinable, true);
  t.is(finished, false);
  t.deepEqual(players, [userTwo].map(getPublicUserFromUser));
  t.deepEqual(inactivePlayers, [userOne].map(getPublicUserFromUser));
});

test('POST /room/:id/quit provides error if user is not in the room', async (t) => {
  const { api } = t.context.app;
  const userCredOne = await createUserCred(t);
  const userCredTwo = await createUserCred(t);
  const userOne = await createUserAndAssert(t, api, userCredOne);
  const userTwo = await createUserAndAssert(t, api, userCredTwo);

  const authTokenTwo = await userCredTwo.user.getIdToken();
  const game = await createGameAndAssert(t, api, userCredOne, userOne);
  const room = await createRoomAndAssert(t, api, userCredOne, game, userOne);
  const { response: { status, data } } = await t.throwsAsync(api.post(`/room/${room.id}/quit`,
    undefined,
    { headers: { authorization: authTokenTwo } }));
  t.is(status, StatusCodes.BAD_REQUEST);
  t.deepEqual(
    data,
    {
      name: 'UserNotInRoom',
      message: `You (${userTwo.username}) are not in the room! You are spectating.`,
    },
  );
});

test('POST /room/:id/quit on a finished room throws an error', async (t) => {
  await testOperationOnFinishedRoom(t, 'quit');
});

test('GET /room/:id returns a room', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred(t);
  const user = await createUserAndAssert(t, api, userCred);

  const game = await createGameAndAssert(t, api, userCred, user);
  const room = await createRoomAndAssert(t, api, userCred, game, user);
  const roomRes = await getRoomAndAssert(t, room.id);
  t.is(roomRes.id, room.id);
});
