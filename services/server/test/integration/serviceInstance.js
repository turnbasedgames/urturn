const test = require('ava');
const { Types } = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const { sleep } = require('../util/util');
const { createUserCred } = require('../util/firebase');
const {
  createUserAndAssert, createGameAndAssert, createRoomAndAssert, getServiceInstanceAndAssert,
} = require('../util/api_util');
const { setupTestFileLogContext, createOrUpdateSideApps } = require('../util/util');
const { setupTestBeforeAfterHooks, spawnApp } = require('../util/app');

setupTestBeforeAfterHooks(test);

setupTestFileLogContext(test);

test('GET /instance returns current serviceInstance', async (t) => {
  const { api } = t.context.app;

  const { data: { serviceInstance }, status } = await api.get('/instance');
  t.is(status, StatusCodes.OK);
  t.true(typeof serviceInstance.id === 'string');
  t.true(serviceInstance.pingCount >= 0);

  const bufferSecs = 1;
  const pingIntervalSecs = 10;

  await sleep((bufferSecs + pingIntervalSecs) * 1000);
  const { data: { serviceInstance: newServiceInstance }, status: newStatus } = await api.get('/instance');
  t.is(newStatus, StatusCodes.OK);
  t.is(newServiceInstance.id, serviceInstance.id);
  t.is(newServiceInstance.pingCount, serviceInstance.pingCount + 1);
});

test('DELETE /instance/cleanup cleans up at max 10 userSockets for each serviceInstance', async (t) => {
  // create a app with seperate mongodb replset so serviceInstance records don't interfere with
  // eachother
  const customApp = await spawnApp(t, { forceCreatePersistentDependencies: true });
  createOrUpdateSideApps(t, [customApp]);
  const { mongoClientDatabase, api } = customApp;
  const serviceInstance = await getServiceInstanceAndAssert(t, api);

  // inject serviceInstance data into separate mongodb
  const now = new Date();
  const bufferMs = 60 * 1000;
  const stale10MinRelativeMs = -10 * 60 * 1000; // 10 minutes
  const stale10Minutes = new Date(now.getTime() + stale10MinRelativeMs);
  const stale20Minutes = new Date(now.getTime() + stale10MinRelativeMs + stale10MinRelativeMs);
  const almostStaleISO = new Date(now.getTime() + stale10MinRelativeMs + bufferMs);
  const stale10MinInstances = [...Array(5).keys()].map((ind) => ({
    _id: new Types.ObjectId(`a0000000000000000000000${ind}`),
    pingCount: 10000000000000,
    createdAt: stale10Minutes,
    updatedAt: stale10Minutes,
  }));
  const almostStaleInstances = [...Array(5).keys()].map((ind) => ({
    _id: new Types.ObjectId(`b0000000000000000000000${ind}`),
    pingCount: 10000000000000,
    createdAt: stale10Minutes,
    updatedAt: almostStaleISO,
  }));
  await mongoClientDatabase.collection('serviceinstances').insertMany([
    ...stale10MinInstances, ...almostStaleInstances]);

  // inject userSocket data
  const user1Cred = await createUserCred(t);
  const user1 = await createUserAndAssert(t, api, user1Cred);
  const user2Cred = await createUserCred(t);
  const user2 = await createUserAndAssert(t, api, user2Cred);
  const users = [user1, user2];

  const game1 = await createGameAndAssert(t, api, user1Cred, user1);
  const game2 = await createGameAndAssert(t, api, user2Cred, user2);
  const room1 = await createRoomAndAssert(t, api, user1Cred, game1, user1);
  const room2 = await createRoomAndAssert(t, api, user2Cred, game2, user2, true);
  const room3 = await createRoomAndAssert(t, api, user2Cred, game2, user2, true);
  const rooms = [room1, room2, room3];

  const expectedStaleUserSocketsDeleted = stale10MinInstances
    .map(({ _id: staleServiceInstanceId }, instInd) => [...Array(10).keys()]
      .map((ind) => ({
        _id: new Types.ObjectId(`c000000000000000000000${instInd}${ind}`),
        user: new Types.ObjectId(users[ind % 2].id),
        room: new Types.ObjectId(rooms[ind % 3].id),
        game: new Types.ObjectId(rooms[ind % 3].game.id),
        socketId: `staleSocket-${instInd}-${ind}`,
        serviceInstance: staleServiceInstanceId,
        updatedAt: stale20Minutes,
      })))
    .flat();
  const staleUserSocketsNotDeleted = [...Array(4).keys()]
    .map((ind) => ({
      _id: new Types.ObjectId(`d0000000000000000000000${ind}`),
      user: new Types.ObjectId(users[ind % 2].id),
      room: new Types.ObjectId(rooms[ind % 3].id),
      game: new Types.ObjectId(rooms[ind % 3].game.id),
      socketId: `veryStaleSocket-${ind}`,
      // eslint-disable-next-line no-underscore-dangle
      serviceInstance: stale10MinInstances[0]._id,
      updatedAt: stale10Minutes,
    }));
  const nonStaleUserSockets = almostStaleInstances
    .map(({ id: instanceId }, instInd) => [...Array(4).keys()]
      .map((ind) => ({
        _id: new Types.ObjectId(`e000000000000000000000${instInd}${ind}`),
        user: new Types.ObjectId(users[ind % 2].id),
        room: new Types.ObjectId(rooms[ind % 3].id),
        game: new Types.ObjectId(rooms[ind % 3].game.id),
        socketId: `notStaleSocket-${instInd}-${ind}`,
        serviceInstance: instanceId,
        updatedAt: stale20Minutes,
      })))
    .flat();
  await mongoClientDatabase.collection('usersockets').insertMany([
    ...expectedStaleUserSocketsDeleted, ...staleUserSocketsNotDeleted, ...nonStaleUserSockets]);

  const { status } = await api.delete('/instance/cleanup');
  t.is(status, StatusCodes.OK);

  // no service instances deleted because too many userSockets to cleanup
  const expectedServiceInstanceIdsLeft = new Set([
    serviceInstance, ...stale10MinInstances, ...almostStaleInstances,
  ]
    .map(({ _id, id }) => _id?.toString() ?? id));
  const actualServiceInstancesLeft = await mongoClientDatabase.collection('serviceinstances').find().toArray();
  const actualServiceInstancesLeftIds = new Set(actualServiceInstancesLeft
    .map(({ _id }) => _id.toString()));
  t.deepEqual(actualServiceInstancesLeftIds, expectedServiceInstanceIdsLeft);

  const actualUserSocketsLeft = await mongoClientDatabase.collection('usersockets').find().toArray();
  const actualUserSocketIdsLeft = new Set(actualUserSocketsLeft.map(({ _id }) => _id.toString()));
  const expectedUserSocketIdsLeft = new Set([...staleUserSocketsNotDeleted, ...nonStaleUserSockets]
    .map(({ _id }) => _id.toString()));
  t.deepEqual(actualUserSocketIdsLeft, expectedUserSocketIdsLeft);
});

test('DELETE /instance/cleanup cleans up at max 10 of the most stale serviceInstances that have zero associated sockets', async (t) => {
  // create a app with seperate mongodb replset so serviceInstance records don't interfere with
  // eachother
  const customApp = await spawnApp(t, { forceCreatePersistentDependencies: true });
  createOrUpdateSideApps(t, [customApp]);
  const { mongoClientDatabase, api } = customApp;
  const serviceInstance = await getServiceInstanceAndAssert(t, api);

  // inject serviceInstance data into separate mongodb
  const now = new Date();
  const bufferMs = 60 * 1000;
  const stale10MinRelativeMs = -10 * 60 * 1000; // 10 minutes
  const stale20MinRelativeMs = -20 * 60 * 1000; // 20 minutes
  const stale10Minutes = new Date(now.getTime() + stale10MinRelativeMs);
  const stale20Minutes = new Date(now.getTime() + stale20MinRelativeMs);
  const almostStaleISO = new Date(now.getTime() + stale10MinRelativeMs + bufferMs);
  const stale10MinInstances = [...Array(10).keys()].map((ind) => ({
    _id: new Types.ObjectId(`a0000000000000000000000${ind}`),
    pingCount: 10000000000000,
    createdAt: stale20Minutes,
    updatedAt: stale10Minutes,
  }));
  const stale20MinInstances = [...Array(10).keys()].map((ind) => ({
    _id: new Types.ObjectId(`a0000000000000000000001${ind}`),
    pingCount: 10000000000000,
    createdAt: stale20Minutes,
    updatedAt: stale20Minutes,
  }));
  const almostStaleInstances = [...Array(10).keys()].map((ind) => ({
    _id: new Types.ObjectId(`b0000000000000000000000${ind}`),
    pingCount: 10000000000000,
    createdAt: stale10Minutes,
    updatedAt: almostStaleISO,
  }));
  await mongoClientDatabase.collection('serviceinstances').insertMany([
    ...stale10MinInstances, ...stale20MinInstances, ...almostStaleInstances]);
  const { status } = await api.delete('/instance/cleanup');
  t.is(status, StatusCodes.OK);

  const expectedServiceInstanceIdsLeft = new Set([
    serviceInstance,
    ...stale10MinInstances, // the most stale are deleted, so stale20MinInstances got deleted
    ...almostStaleInstances,
  ]
    .map(({ _id, id }) => _id?.toString() ?? id));
  const serviceInstancesLeft = await mongoClientDatabase.collection('serviceinstances').find().toArray();
  const serviceInstancesLeftIds = new Set(serviceInstancesLeft.map(({ _id }) => _id.toString()));
  t.deepEqual(serviceInstancesLeftIds, expectedServiceInstanceIdsLeft);
});
