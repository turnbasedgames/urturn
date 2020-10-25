/* eslint-disable no-underscore-dangle */
const { serial: test } = require('ava');
const sinon = require('sinon');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

require('../util/absolutePath');
const TestApp = require('test/util/app');
const User = require('src/models/user');
const { PATH } = require('src/api/routes/user');
const { JWT_TOKEN_TYPE } = require('src/loaders/auth');

test.beforeEach(async (t) => {
  const app = new TestApp();
  await app.setup();

  // eslint-disable-next-line no-param-reassign
  t.context = { app };
});

test.afterEach(async (t) => {
  await t.context.app.cleanup();
  sinon.restore();
});

test(`DELETE ${PATH}/logout revokes token access`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };

  const {
    body: { accessToken, refreshToken },
  } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);

  await request(app.loaders.app)
    .delete(`${PATH}/logout`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.OK);

  await Promise.all([
    request(app.loaders.app)
      .get(`${PATH}/profile`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(StatusCodes.UNAUTHORIZED),
    request(app.loaders.app)
      .get(`${PATH}/token`)
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(StatusCodes.UNAUTHORIZED),
  ]);

  t.pass();
});

test(`GET ${PATH}/profile responds 401 without accessToken`, async (t) => {
  const { app } = t.context;
  await request(app.loaders.app)
    .get(`${PATH}/profile`)
    .expect(StatusCodes.UNAUTHORIZED);
  t.pass();
});

test(`GET ${PATH}/profile responds 401 if accessToken out of date`, async (t) => {
  const clock = sinon.useFakeTimers({
    toFake: ['Date'],
  });
  const expireLengthMs = 15 * 60 * 1000;
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const { body: { accessToken } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);
  await clock.tickAsync(expireLengthMs);
  await request(app.loaders.app)
    .get(`${PATH}/profile`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.UNAUTHORIZED);
  t.pass();
});

test(`GET ${PATH}/profile gives 401 if user does not exist`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const { body: { accessToken, user } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({ user: userDoc })
    .expect(StatusCodes.OK);
  await User.deleteOne({ username: user.username });
  await request(app.loaders.app)
    .get(`${PATH}/profile`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.UNAUTHORIZED);
  t.pass();
});

test(`GET ${PATH}/token gives valid accessToken`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const { body: { refreshToken } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);
  const { body: { accessToken } } = await request(app.loaders.app)
    .get(`${PATH}/token`)
    .set('Authorization', `Bearer ${refreshToken}`)
    .expect(StatusCodes.OK);
  await request(app.loaders.app)
    .get(`${PATH}/profile`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.OK);
  t.pass();
});

test(`GET ${PATH}/token responds 401 if refreshToken out of date`, async (t) => {
  const clock = sinon.useFakeTimers({
    toFake: ['Date'],
  });
  const expireLengthMs = 365 * 24 * 60 * 60 * 1000;
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const { body: { refreshToken } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);
  await clock.tickAsync(expireLengthMs);
  await request(app.loaders.app)
    .get(`${PATH}/token`)
    .set('Authorization', `Bearer ${refreshToken}`)
    .expect(StatusCodes.UNAUTHORIZED);
  t.pass();
});

test(`GET ${PATH}/token responds 401 if improper token type is given`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const { body: { accessToken } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);
  await request(app.loaders.app)
    .get(`${PATH}/token`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.UNAUTHORIZED);
  t.pass();
});

test(`POST ${PATH}/login provides accessToken and refreshToken`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };

  await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);
  const { body: { accessToken, refreshToken } } = await request(app.loaders.app)
    .post(`${PATH}/login`)
    .send({
      username: userDoc.username,
      password: userDoc.password,
    })
    .expect(StatusCodes.OK);
  await request(app.loaders.app)
    .get(`${PATH}/profile`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.OK);
  await request(app.loaders.app)
    .get(`${PATH}/token`)
    .set('Authorization', `Bearer ${refreshToken}`)
    .expect(StatusCodes.OK);
  t.pass();
});

test(`POST ${PATH}/login responds 401 if username does not exist`, async (t) => {
  const { app } = t.context;
  const { body } = await request(app.loaders.app)
    .post(`${PATH}/login`)
    .send({
      username: 'random username',
      password: 'password',
    })
    .expect(StatusCodes.UNAUTHORIZED);
  t.is(body.error.message, 'Invalid username and/or password');
});

test(`POST ${PATH}/login responds 401 if incorrect password`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };

  await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);

  const { body } = await request(app.loaders.app)
    .post(`${PATH}/login`)
    .send({
      username: userDoc.username,
      password: 'Invalid password',
    })
    .expect(StatusCodes.UNAUTHORIZED);

  t.is(body.error.message, 'Invalid username and/or password');
});

test(`POST ${PATH}/signup provides user doc and access and refresh tokens`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };

  const { body: { accessToken, refreshToken, user } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);
  const accessTokenDecoded = jwt.decode(accessToken);
  const refreshTokenDecoded = jwt.decode(refreshToken);

  t.is(user.username, userDoc.username);
  t.true(_.isMatch(
    accessTokenDecoded,
    {
      userId: user._id,
      type: JWT_TOKEN_TYPE.ACCESS,
      version: 0,
    },
  ));
  t.true(_.isMatch(
    refreshTokenDecoded,
    {
      userId: user._id,
      type: JWT_TOKEN_TYPE.REFRESH,
      version: 0,
    },
  ));
});

test(`POST ${PATH}/signup duplicate emails not allowed`, async (t) => {
  const { app } = t.context;
  const user1Doc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const dupDoc = {
    username: 'user2',
    password: 'Password12#',
    email: 'email@url.com',
  };

  await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: user1Doc,
    });
  const { body } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: dupDoc,
    })
    .expect(StatusCodes.BAD_REQUEST);
  t.is(body.error.message, 'User validation failed: email: Error, expected `email` to be unique. Value: `email@url.com`');
});

test(`POST ${PATH}/signup duplicate usernames not allowed`, async (t) => {
  const { app } = t.context;
  const user1Doc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };
  const dupDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'other_email@url.com',
  };

  await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: user1Doc,
    });
  const { body } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: dupDoc,
    })
    .expect(StatusCodes.BAD_REQUEST);
  t.is(body.error.message, 'User validation failed: username: Error, expected `username` to be unique. Value: `user1`');
});

test(`POST ${PATH}/signup responds 400 for password less than 8 characters`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'pass',
    email: 'email@url.com',
  };
  const { body } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.BAD_REQUEST);
  t.true(body.error.message.includes('min'));
});

test(`POST ${PATH}/signup tokens should authenticate user for /profile endpoint`, async (t) => {
  const { app } = t.context;
  const userDoc = {
    username: 'user1',
    password: 'Password12#',
    email: 'email@url.com',
  };

  const { body: { accessToken } } = await request(app.loaders.app)
    .post(`${PATH}/signup`)
    .send({
      user: userDoc,
    })
    .expect(StatusCodes.OK);

  await request(app.loaders.app)
    .get(`${PATH}/profile`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(StatusCodes.OK);

  t.pass();
});
