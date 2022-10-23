const test = require('ava');
const { waitForOutput } = require('../util/util');
const { spawnApp } = require('../util/app');

test.before(async (t) => {
  const app = await spawnApp(t);
  /* eslint-disable no-param-reassign */
  t.context.createdUsers = [];
  t.context.app = app;
  /* eslint-enable no-param-reassign */
});

test.after.always(async (t) => {
  await t.context.app.cleanup();
});

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
    t.true(await waitForOutput(t, `${envName} environment variable is not defined`, testApp.stderrMessages));
    t.is(testApp.server.exitCode, 1);
  }));
});
