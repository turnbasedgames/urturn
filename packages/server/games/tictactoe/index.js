const express = require('express');
const { StatusCodes } = require('http-status-codes');

const httpLogger = require('./src/middleware/httpLogger');
const logger = require('./src/logger');
const setupDB = require('./src/setupDB');

const PORT = process.env.PORT || 8080;
const setupDBPromise = setupDB();
const app = express();
app.use(httpLogger);

app.get('/readiness', async (req, res) => {
  await setupDBPromise;
  res.sendStatus(StatusCodes.OK);
});

app.listen(PORT, () => {
  logger.info(`Listening on Port ${PORT}`);
});
