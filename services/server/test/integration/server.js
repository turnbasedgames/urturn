const test = require('ava');
const { waitForOutput, waitFor, setupTestFileLogContext } = require('../util/util');
const { spawnApp } = require('../util/app');
const { setupTestBeforeAfterHooks } = require('../util/util');

setupTestBeforeAfterHooks(test);

setupTestFileLogContext(test);

test('Server fails and process exits when required Stripe environment variables are not provided', async (t) => {
  const { app } = t.context;
  const STRIPE_ENV_NAMES = ['STRIPE_KEY', 'STRIPE_WEBHOOK_SECRET'];
  await Promise.all(STRIPE_ENV_NAMES.map(async (envName) => {
    const testApp = await spawnApp(
      t,
      {
        overrideEnv: { [envName]: undefined },
        defaultMongoEnv: app.envWithMongo,
        defaultRedisEnv: app.envWithRedis,
        noWait: true,
      },
    );
    t.true(await waitForOutput(t.context.log, `${envName} environment variable is not defined`, testApp.stderrMessages));
    t.is(await waitFor(t.context.log, async () => {
      if (testApp.server.exitCode == null) {
        throw new Error('server has not terminated yet...');
      }
      return testApp.server.exitCode;
    }), 1);
  }));
});
