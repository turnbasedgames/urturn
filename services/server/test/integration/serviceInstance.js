const test = require('ava');
const { StatusCodes } = require('http-status-codes');
const { sleep } = require('../util/util');

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

  // inject serviceInstance and userSocket data into separate mongodb
  const { mongoClientDatabase } = customApp;
  mongoClientDatabase.collection('usersockets').insertMany([

  ]);
  mongoClientDatabase.collection('serviceInstances').insertMany([

  ]);
});

test('DELETE /instance/cleanup cleans up at max 10 serviceInstances that have zero associated sockets', async (t) => {

});
