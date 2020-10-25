const express = require('express');
const { StatusCodes } = require('http-status-codes');

const PATH = '/users';

const {
  signUpLocal, loginLocal, jwtAccessTokenAuth, jwtRefreshTokenAuth, issueAccessJWT, issueRefreshJWT,
} = require('src/loaders/auth');

const router = express.Router();

router.delete('/logout', jwtAccessTokenAuth, async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  res.sendStatus(StatusCodes.OK);
});

router.get('/profile', jwtAccessTokenAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/token', jwtRefreshTokenAuth, async (req, res) => {
  const accessToken = issueAccessJWT(req.user, req.refreshToken);
  res.json({
    accessToken,
  });
});

router.post('/login', loginLocal, async (req, res) => {
  const refreshToken = issueRefreshJWT(req.user);
  const accessToken = issueAccessJWT(req.user);
  res.json({
    accessToken,
    refreshToken,
  });
});

router.post('/signup', signUpLocal, async (req, res) => {
  const refreshToken = issueRefreshJWT(req.user);
  const accessToken = issueAccessJWT(req.user);
  res.json({
    user: req.user.toJSON(),
    accessToken,
    refreshToken,
  });
});

module.exports = {
  router,
  PATH,
};
