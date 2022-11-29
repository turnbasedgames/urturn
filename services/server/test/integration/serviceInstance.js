const test = require('ava');
const { StatusCodes } = require('http-status-codes');
const { sleep } = require('../util/util');

const { setupTestFileLogContext } = require('../util/util');
const { setupTestBeforeAfterHooks } = require('../util/app');

setupTestBeforeAfterHooks(test);

setupTestFileLogContext(test);

test('GET /instance returns current serviceInstance', async (t) => {
  const { api } = t.context.app;

  const { data: { serviceInstance: { pingCount } }, status } = await api.get('/instance');
  t.is(status, StatusCodes.OK);
  t.true(pingCount >= 0);

  const bufferSecs = 1;
  const pingIntervalSecs = 10;

  await sleep((bufferSecs + pingIntervalSecs) * 1000);
  const { data: { serviceInstance: { pingCount: newPingCount } }, status: newStatus } = await api.get('/instance');
  t.is(newStatus, StatusCodes.OK);
  t.is(newPingCount, pingCount + 1);
});
