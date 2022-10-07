const test = require('ava');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const { spawnApp } = require('../util/app');
const { createUserCred } = require('../util/firebase');
const { createUserAndAssert, cleanupTestUsers } = require('../util/api_util');
const { testStripeClient, testStripeWebhookSecret, createTestWebhookHeader } = require('../util/stripe');
const { createOrUpdateSideApps } = require('../util/util');

test.before(async (t) => {
  const app = await spawnApp();
  /* eslint-disable no-param-reassign */
  t.context.createdUsers = [];
  t.context.app = app;
  /* eslint-enable no-param-reassign */
});

test.after.always(async (t) => {
  await cleanupTestUsers(t);
  await t.context.app.cleanup();
});

test('GET /user returns 401 if user is not authenticated', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get('/user'));
  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /user returns 401 if invalid token is provided', async (t) => {
  const { api } = t.context.app;
  const { response: { status } } = await t.throwsAsync(api.get('/user', { headers: { authorization: 'invalid token' } }));
  t.is(status, StatusCodes.UNAUTHORIZED);
});

test('GET /user returns 404 when requester is authenticated but no corresponding user exists', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();
  const { response: { status, data: { name } } } = await t.throwsAsync(api.get('/user', { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.NOT_FOUND);
  t.is(name, 'UserNotFound');
});

test('GET /user returns user object', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  t.context.createdUsers.push(userCred);

  const authToken = await userCred.user.getIdToken();
  const { status, data } = await api.get('/user', { headers: { authorization: authToken } });
  t.is(status, StatusCodes.OK);
  const { urbux, ...publicUser } = user;
  t.deepEqual(data, { user: publicUser });
});

test('GET /user includePrivate query parameter returns private values', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred, true);
  t.context.createdUsers.push(userCred);

  const authToken = await userCred.user.getIdToken();
  const { status, data } = await api.get('/user', {
    headers: { authorization: authToken },
    params: { includePrivate: true },
  });

  t.is(status, StatusCodes.OK);
  t.deepEqual(data, { user });
});

test('POST /user returns 409 if one already exists', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  t.context.createdUsers.push(userCred);

  const authToken = await userCred.user.getIdToken();
  const { response: { status } } = await t.throwsAsync(api.post('/user', {}, { headers: { authorization: authToken } }));
  t.is(status, StatusCodes.CONFLICT);
});

test('POST /user returns 500 if username generation fails', async (t) => {
  // create a separate app to force the only possible username to be "test"
  const customApp = await spawnApp({ nameDictionary: 'test', nameIterations: 0, forceCreatePersistentDependencies: true });
  createOrUpdateSideApps(t, [customApp]);
  const { api } = customApp;

  // the first user created will be successful and take up the only generated username "test"
  const userCredOne = await createUserCred();
  await createUserAndAssert(t, api, userCredOne);
  t.context.createdUsers.push(userCredOne);

  const userCredTwo = await createUserCred();
  const authTokenTwo = await userCredTwo.user.getIdToken();
  const { response: { status, data: { name } } } = await t.throwsAsync(api.post('/user', {}, { headers: { authorization: authTokenTwo } }));
  t.is(status, StatusCodes.INTERNAL_SERVER_ERROR);
  t.is(name, 'UsernameGeneration');
});

test('POST /user creates user', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  await createUserAndAssert(t, api, userCred);
  t.context.createdUsers.push(userCred);
});

test('POST /user/create-payment-intent throws error for unsupported currency', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();

  await createUserAndAssert(t, api, userCred);

  const { response: { status } } = await t.throwsAsync(api.post('/user/create-payment-intent', {
    currency: 'ghs',
    amount: 1000,
  }, { headers: { authorization: authToken } }));

  t.is(status, StatusCodes.BAD_REQUEST);

  t.context.createdUsers.push(userCred);
});

test('POST /user/create-payment-intent throws error for any other amount than 100 usd', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();

  await createUserAndAssert(t, api, userCred);

  const { response: { status } } = await t.throwsAsync(api.post('/user/create-payment-intent', {
    currency: 'usd',
    amount: 50,
  }, { headers: { authorization: authToken } }));

  t.is(status, StatusCodes.BAD_REQUEST);

  t.context.createdUsers.push(userCred);
});

test('POST /user/create-payment-intent creates a payment intent for a user', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const authToken = await userCred.user.getIdToken();

  await createUserAndAssert(t, api, userCred);

  const { status, data } = await api.post('/user/create-payment-intent', {
    currency: 'usd',
    amount: 100,
  }, { headers: { authorization: authToken } });

  t.is(status, StatusCodes.CREATED);
  t.true(data.clientSecret.includes('pi'));

  t.context.createdUsers.push(userCred);
});

test('POST /user/purchase/webhook throws 400 if wrong currency provided', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const wrongCurrencyPayload = {
    data: {
      object: {
        amount: 100,
        id: '894318943218943219',
        currency: 'ghs',
        metadata: {
          userId: user.id,
        },
      },
    },
    type: 'payment_intent.succeeded',
  };
  const header = createTestWebhookHeader(
    testStripeClient, wrongCurrencyPayload, testStripeWebhookSecret,
  );
  const { response: { data: { message }, status } } = await t.throwsAsync(
    api.post('/user/purchase/webhook', wrongCurrencyPayload, { headers: { 'Stripe-Signature': header } }),
  );

  t.is(status, StatusCodes.BAD_REQUEST);
  t.is(message, 'conversion to urbux failed (currency=ghs, paymentAmount=100)');
  t.context.createdUsers.push(userCred);
});

test('POST /user/purchase/webhook throws 400 if no userId provided', async (t) => {
  const { api } = t.context.app;
  const wrongCurrencyPayload = {
    data: {
      object: {
        amount: 100,
        id: '8943189432189432123',
        currency: 'usd',
        metadata: {},
      },
    },
    type: 'payment_intent.succeeded',
  };
  const header = createTestWebhookHeader(
    testStripeClient, wrongCurrencyPayload, testStripeWebhookSecret,
  );
  const { response: { data: { message }, status } } = await t.throwsAsync(
    api.post('/user/purchase/webhook', wrongCurrencyPayload, { headers: { 'Stripe-Signature': header } }),
  );

  t.is(status, StatusCodes.BAD_REQUEST);
  t.is(message, '"event.data.object.metadata.userId" was not provided!');
});

test('POST /user/purchase/webhook throws 404 if no user found with provided userId', async (t) => {
  const { api } = t.context.app;
  const userId = new mongoose.Types.ObjectId();
  const wrongCurrencyPayload = {
    data: {
      object: {
        amount: 100,
        id: '894318943218943219',
        currency: 'usd',
        metadata: {
          userId,
        },
      },
    },
    type: 'payment_intent.succeeded',
  };
  const header = createTestWebhookHeader(
    testStripeClient, wrongCurrencyPayload, testStripeWebhookSecret,
  );
  const { response: { data: { message }, status } } = await t.throwsAsync(
    api.post('/user/purchase/webhook', wrongCurrencyPayload, { headers: { 'Stripe-Signature': header } }),
  );

  t.is(status, StatusCodes.NOT_FOUND);
  t.is(message, `Could not find user with provided userId (userId=${userId})`);
});

test('POST /user/purchase/webhook throws 400 if bad Stripe-Signature header provided', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const payload = {
    id: 'evt_test_webhook',
    object: 'event',
    data: {
      object: {
        amount: 100,
        id: '894318943218943210',
        currency: 'usd',
        metadata: {
          userId: user.id,
        },
      },
    },
    type: 'payment_intent.succeeded',
  };
  const header = createTestWebhookHeader(testStripeClient, payload, 'bad-webhook-secret');
  const { response: { data: { message }, status } } = await t.throwsAsync(api.post('/user/purchase/webhook', payload, { headers: { 'Stripe-Signature': header } }));

  t.is(status, StatusCodes.BAD_REQUEST);
  t.is(message, 'No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? https://github.com/stripe/stripe-node#webhook-signing');
  t.context.createdUsers.push(userCred);
});

test('POST /user/purchase/webhook adds urbux to the user and stores currencyToUrbuxTransaction', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();

  const payload = {
    id: 'evt_test_webhook',
    object: 'event',
    data: {
      object: {
        amount: 100,
        id: '894318943218943217',
        currency: 'usd',
        metadata: {
          userId: user.id,
        },
      },
    },
    type: 'payment_intent.succeeded',
  };

  const header = createTestWebhookHeader(testStripeClient, payload, testStripeWebhookSecret);
  const { status } = await api.post('/user/purchase/webhook', payload, { headers: { 'Stripe-Signature': header } });

  const { data: { user: newUser } } = await api.get('/user', {
    headers: { authorization: authToken },
    params: { includePrivate: true },
  });

  t.is(status, StatusCodes.OK);
  t.is(newUser.id, user.id);
  t.is(newUser.urbux, 100);
  t.context.createdUsers.push(userCred);
});

test('POST /user/purchase/webhook duplicate transactions (paymentIntent.id gets deduplicated) result in same user state', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();

  const payload = {
    id: 'evt_test_webhook',
    object: 'event',
    data: {
      object: {
        amount: 100,
        id: '894318943218943215',
        currency: 'usd',
        metadata: {
          userId: user.id,
        },
      },
    },
    type: 'payment_intent.succeeded',
  };

  const header = createTestWebhookHeader(testStripeClient, payload, testStripeWebhookSecret);
  const numRequests = 10;
  const requests = Array(numRequests).fill(null).map(() => api.post('/user/purchase/webhook', payload, { headers: { 'Stripe-Signature': header } }));
  const responses = await Promise.all(requests);

  const { data: { user: newUser } } = await api.get('/user', {
    headers: { authorization: authToken },
    params: { includePrivate: true },
  });

  t.true(responses.every(({ status }) => status === StatusCodes.OK));
  t.is(newUser.id, user.id);
  t.is(newUser.urbux, 100);
  t.context.createdUsers.push(userCred);
});

test('POST /user/purchase/webhook with an unhandled event type is ignored and just logged', async (t) => {
  const { api } = t.context.app;
  const userCred = await createUserCred();
  const user = await createUserAndAssert(t, api, userCred);
  const authToken = await userCred.user.getIdToken();

  const unknownEventTypePayload = {
    id: 'evt_test_webhook',
    object: 'event',
    data: {
      object: {
        amount: 100,
        id: '894318943218943218',
        currency: 'usd',
        metadata: {
          userId: user.id,
        },
      },
    },
    type: 'this-event-type-definitely-does-not-exist-head-ass',
  };

  const header = createTestWebhookHeader(
    testStripeClient, unknownEventTypePayload, testStripeWebhookSecret,
  );
  const { status } = await api.post('/user/purchase/webhook', unknownEventTypePayload, { headers: { 'Stripe-Signature': header } });

  const { data: { user: newUser } } = await api.get('/user', {
    headers: { authorization: authToken },
    params: { includePrivate: true },
  });

  t.is(status, StatusCodes.OK);
  t.is(newUser.id, user.id);
  t.is(newUser.urbux, 0); // urbux is unchanged because this event type is not handled
  t.context.createdUsers.push(userCred);
});

test('POST /user username generator adds random numbers when there is a collision', async (t) => {
  // create a separate app to force possible usernames to be "test" and "test_[0-9]"
  const customApp = await spawnApp({ nameDictionary: 'test', nameIterations: 1 });
  createOrUpdateSideApps(t, [customApp]);
  const { api } = customApp;

  // the first user created will be successful and take up the only generated username "test"
  const userCredOne = await createUserCred();
  await createUserAndAssert(t, api, userCredOne);
  t.context.createdUsers.push(userCredOne);

  const userCredTwo = await createUserCred();
  const userTwo = await createUserAndAssert(t, api, userCredTwo);
  t.context.createdUsers.push(userCredTwo);
  t.regex(userTwo.username, /test_[0-9]/);
});

test('Server fails and process exits when required Stripe environment variables are not provided', async (t) => {
  const { app } = t.context;
  const STRIPE_ENV_NAMES = ['STRIPE_KEY', 'STRIPE_WEBHOOK_SECRET'];
  const startupErrors = await Promise.all(STRIPE_ENV_NAMES.map((envName) => t.throwsAsync(spawnApp({
    overrideEnv: { [envName]: undefined },
    defaultMongoEnv: app.envWithMongo,
    defaultRedisEnv: app.envWithRedis,
  }))));

  // didn't want to spend time finding a good way to assert error logs, so
  // we are assuming that if there is a startup timeout error than its because the
  // missing STRIPE_KEY
  t.true(startupErrors.every(({ message }) => message.includes('Server was not ready after')), `Server startup errors: ${startupErrors.join(',')}`);
});
