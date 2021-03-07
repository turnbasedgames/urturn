const express = require('express');
const expressSession = require('express-session');
const { StatusCodes } = require('http-status-codes');
const cors = require('cors');

const httpLogger = require('./src/middleware/httpLogger');
const logger = require('./src/logger');
const setupDB = require('./src/setupDB');
const userRouter = require('./src/models/user/route');
const errorHandler = require('./src/middleware/errorHandler');

const PORT = process.env.PORT || 8080;
const setupDBPromise = setupDB();
const app = express();

app.use(cors());
app.use(httpLogger);
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(userRouter.PATH, userRouter.router);

app.get('/readiness', async (req, res) => {
  await setupDBPromise;
  res.sendStatus(StatusCodes.OK);
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Listening on Port ${PORT}`);
});
