const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const User = require('src/models/user');

// TODO: setup way to retrieve secret
const JWT_PRIV_KEY = 'secret';
const JWT_ACCESS_EXPIRATION = '15m';
const JWT_REFRESH_EXPIRATION = '365d';
const JWT_TOKEN_TYPE = Object.freeze({ REFRESH: 'REFRESH', ACCESS: 'ACCESS' });

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.status = StatusCodes.UNAUTHORIZED;
  }
}

async function signUpLocal(req, res, next) {
  const user = new User(req.body.user);
  try {
    await user.save();
    req.user = user;
  } catch (err) {
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }
  next();
}

async function loginLocal(req, res, next) {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select('+password');
  if (user && await user.authenticate(password)) {
    req.user = user;
    return next();
  }
  throw new AuthenticationError('Invalid username and/or password');
}

async function jwtTokenAuth(type, req, res, next) {
  if (!('headers' in req && 'authorization' in req.headers)) {
    throw new AuthenticationError('Bearer token required!');
  }

  const rawToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
  let token;
  try {
    token = jwt.verify(rawToken, JWT_PRIV_KEY);
  } catch (err) {
    err.status = StatusCodes.UNAUTHORIZED;
    throw err;
  }
  if (token.type !== type) {
    throw new AuthenticationError('Invalid token type');
  }
  const user = await User.findOne({ _id: token.userId });
  if (user) {
    if (user.tokenVersion !== token.version) {
      throw new AuthenticationError('Invalid token version');
    }
    req.user = user;
    return next();
  }
  throw new AuthenticationError('User specified by token does not exist');
}

function jwtAccessTokenAuth(req, res, next) {
  return jwtTokenAuth(JWT_TOKEN_TYPE.ACCESS, req, res, next);
}

function jwtRefreshTokenAuth(req, res, next) {
  return jwtTokenAuth(JWT_TOKEN_TYPE.REFRESH, req, res, next);
}

function issueJWT(doc, options) {
  return jwt.sign(doc, JWT_PRIV_KEY, options);
}

function issueAccessJWT(user) {
  return issueJWT({
    userId: user.id,
    type: JWT_TOKEN_TYPE.ACCESS,
    version: user.tokenVersion,
  }, { expiresIn: JWT_ACCESS_EXPIRATION });
}

function issueRefreshJWT(user) {
  return issueJWT({
    userId: user.id,
    type: JWT_TOKEN_TYPE.REFRESH,
    version: user.tokenVersion,
  }, { expiresIn: JWT_REFRESH_EXPIRATION });
}

module.exports = {
  signUpLocal,
  loginLocal,
  jwtAccessTokenAuth,
  jwtRefreshTokenAuth,
  issueAccessJWT,
  issueRefreshJWT,
  JWT_TOKEN_TYPE,
};
