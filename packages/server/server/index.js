const express = require('express');
const expressSession = require('express-session');
const { StatusCodes } = require('http-status-codes');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const httpLogger = require('./src/middleware/httpLogger');
const logger = require('./src/logger');
const setupDB = require('./src/setupDB');
const userRouter = require('./src/models/user/route');

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:8080/user/auth/google/callback',
  pkce: true,
  state: true,
  enableProof: true,
},
((token, tokenSecret, profile, done) => {
  logger.info(`google user:${profile}`);
  // User.findOrCreate({ googleId: profile.id }, (err, user) => done(err, user));
  return done(null, profile);
})));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser((user, cb) => {
  logger.info(`serializing user:${user}`);
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  logger.info(`deserializing user:${obj}`);
  cb(null, obj);
});

const PORT = process.env.PORT || 8080;
const setupDBPromise = setupDB();
const app = express();

app.use(cors());
app.use(httpLogger);
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use(userRouter.PATH, userRouter.router);

app.get('/readiness', async (req, res) => {
  await setupDBPromise;
  res.sendStatus(StatusCodes.OK);
});

app.listen(PORT, () => {
  logger.info(`Listening on Port ${PORT}`);
});
