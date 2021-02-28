const express = require('express');
const passport = require('passport');
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const logger = require('../../logger');

// const User = require('./user');

const PATH = '/user';
const router = express.Router();

router.get('/', (req, res) => {
  res.send({ user: req.user });
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(PATH);
  });

module.exports = {
  router,
  PATH,
};
