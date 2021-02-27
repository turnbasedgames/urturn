const express = require('express');
const httpLogger = require('./src/middleware/httpLogger');
const logger = require('./src/logger');

const PORT = process.env.PORT || 8080;
const app = express();
app.use(httpLogger);

app.listen(PORT, () => {
  logger.info(`Listening on Port ${PORT}`);
});
