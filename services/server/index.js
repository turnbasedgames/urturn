const express = require('express');
const cors = require('cors');
const http = require('http');
const { errors } = require('celebrate');
const { StatusCodes } = require('http-status-codes');
const socketio = require('socket.io');

console.log('FUCKAETAEASDDGSDFKJASDKJAS:DAJSLKDASL:KJASDL:KJDASASDASD');
require('./src/setupFirebase');
const { setupExpressLoggerMiddleware } = require('./src/middleware/httpLogger');
const logger = require('./src/logger');
const setupDB = require('./src/setupDB');
const userRouter = require('./src/models/user/route');
const gameRouter = require('./src/models/game/route');
const roomRouter = require('./src/models/room/route');
const errorHandler = require('./src/middleware/errorHandler');
const setupSocketio = require('./src/setupSocketio');
const { setupRedis } = require('./src/setupRedis');

const PORT = process.env.PORT || 8080;

const main = async () => {
  logger.info('Starting server...');
  const cleanupDB = await setupDB();
  logger.info('mongodb connection is ready');

  const app = express();
  app.use(await setupExpressLoggerMiddleware());
  const httpServer = http.createServer(app);
  const io = socketio(httpServer, {
    cors: {
      origin: '*',
    },
  });

  const cleanupRedis = await setupRedis({ io });
  const cleanupSocketioServer = setupSocketio(io);

  app.use(cors());
  app.use((req, res, next) => {
    // stripe webhook client requires a raw express body for verifying the signature
    if (req.originalUrl === '/user/purchase/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  app.use(userRouter.PATH, userRouter.router);
  app.use(gameRouter.PATH, gameRouter.router);
  app.use(roomRouter.PATH, roomRouter.setupRouter({ io }));

  app.get('/readiness', async (req, res) => {
    res.sendStatus(StatusCodes.OK);
  });

  app.use(errors());
  app.use(errorHandler);

  logger.info(`attempting to listen on Port ${PORT}`);
  httpServer.listen(PORT, () => {
    logger.info(`listening on Port ${PORT}`);
  });

  return () => {
    logger.warn('cleaning up nodejs application');
    logger.warn('closing http server...');
    const socketIoCleanupPromise = cleanupSocketioServer();
    httpServer.close(async () => {
      logger.warn('successfully closed http server');
      try {
        // wait for socketIo to cleanup first as it relies on the db working
        await socketIoCleanupPromise;
        await Promise.all([cleanupRedis(), cleanupDB()]);
        logger.warn('successful graceful shutdown');
        process.exit(0);
      } catch (error) {
        logger.error('failed to do graceful shutdown', error);
        process.exit(1);
      }
    });
  };
};

const cleanupAppPromise = main().catch((err) => {
  logger.error('error occurred when starting app', err);
});

let cleaningUp = false;
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach((sig) => {
  process.on(sig, () => {
    logger.warn(`signal received to terminate process: ${sig}`);
    if (cleaningUp) {
      logger.warn('already triggered cleanup, ignoring signal');
    } else {
      cleaningUp = true;
      cleanupAppPromise.then((cleanupApp) => {
        cleanupApp();
      });
    }
  });
});
