const express = require('express');
const cors = require('cors');
const http = require('http');
const { errors } = require('celebrate');
const { StatusCodes } = require('http-status-codes');
const socketio = require('socket.io');

require('./src/setupFirebase');
const setupHttpLogger = require('./src/middleware/setupHttpLogger');
const logger = require('./src/logger');
const setupDB = require('./src/setupDB');
const userRouter = require('./src/models/user/route');
const gameRouter = require('./src/models/game/route');
const roomRouter = require('./src/models/room/route');
const errorHandler = require('./src/middleware/errorHandler');
const setupSocketio = require('./src/setupSocketio');
const { setupRedis, pubClient, subClient } = require('./src/setupRedis');

const PORT = process.env.PORT || 8080;

const main = async () => {
  logger.info('Starting server...');
  const app = express();
  app.use(await setupHttpLogger());
  const httpServer = http.createServer(app);
  const db = setupDB();
  const io = socketio(httpServer, {
    cors: {
      origin: '*',
    },
  });

  await setupRedis({ io });
  setupSocketio(io);

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
    await db;
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
    httpServer.close(async () => {
      logger.warn('closed express app');
      try {
        await Promise.all([pubClient.quit(), subClient.quit()]);
        logger.warn('closed redis clients');
      } catch {
        logger.error('failed to close redis clients');
      }
      process.exit();
    });
    setTimeout(() => {
      logger.error('cleanup timed out');
      process.exit();
    }, 2000);
  };
};

const cleanupAppPromise = main().catch((err) => {
  logger.error('error occurred when starting app', err);
});

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => {
    logger.warn(`signal received to terminate process: ${sig}`);
    cleanupAppPromise.then((cleanupApp) => {
      cleanupApp();
    });
  });
});
