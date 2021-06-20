const express = require('express');
const cors = require('cors');
const http = require('http');
const { errors } = require('celebrate');
const { StatusCodes } = require('http-status-codes');
const socketio = require('socket.io');

require('./src/setupFirebase');
const httpLogger = require('./src/middleware/httpLogger');
const logger = require('./src/logger');
const setupDB = require('./src/setupDB');
const userRouter = require('./src/models/user/route');
const gameRouter = require('./src/models/game/route');
const roomRouter = require('./src/models/room/route');
const errorHandler = require('./src/middleware/errorHandler');
const setupSocketio = require('./src/setupSocketio');

const PORT = process.env.PORT || 8080;
const app = express();
const httpServer = http.createServer(app);
const db = setupDB();
const io = socketio(httpServer, { serveClient: false });
setupSocketio(io);

app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.use(userRouter.PATH, userRouter.router);
app.use(gameRouter.PATH, gameRouter.router);
app.use(roomRouter.PATH, roomRouter.setupRouter({ io }));

app.get('/readiness', async (req, res) => {
  await db;
  res.sendStatus(StatusCodes.OK);
});

app.use(errors());
app.use(errorHandler);

httpServer.listen(PORT, () => {
  logger.info(`listening on Port ${PORT}`);
});
