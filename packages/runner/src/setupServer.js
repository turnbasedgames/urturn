import express from 'express';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { watchFile } from 'fs';
import { pathToFileURL } from 'node:url';
import { userBackend } from '../config/paths.js';
import { filterRoomState, getPlayerById, validateRoomState } from './room/roomState.js';
import requireUtil from './requireUtil.cjs';
import logger from './logger.js';
import wrapSocketErrors from './middleware/wrapSocketErrors.js';
import {
  onRoomStart, onPlayerJoin, onPlayerQuit, onPlayerMove, deepCopy,
} from './room/wrappers.js';

const backendHotReloadIntervalMs = 100;

const getLatestBackendModule = async (backendPath) => {
  try {
    // use pathToFileURL because Windows absolute file paths need to be prepended with "file:///c:" instead of just "c:"
    // see: https://github.com/nodejs/node/issues/31710
    const absoluteFileUrl = pathToFileURL(backendPath).href;

    // Nodejs doesn't support cache busting interface yet for esm https://github.com/nodejs/help/issues/2806
    // This is a workaround to get a completely fresh backendModule, as the query
    // will be new every millisecond. When the issue gets resolved we should use the
    // interface to delete old cache entries. This workaround causes a memory leak where
    // old cached modules never cleaned up.
    const cacheBustingModulePath = `${absoluteFileUrl}?update=${Date.now()}`;
    const { default: backendModule } = await import(cacheBustingModulePath);

    // the cacheBusting workaround for esm modules does not work for commonjs
    requireUtil.cleanupCommonJSModule(backendPath);

    return backendModule;
  } catch (err) {
    logger.error('error while loading your room functions:', err);
    return undefined;
  }
};

async function setupServer({ apiPort }) {
  const app = express();
  const httpServer = createServer(app);
  let playerIdCounter;
  let roomState;
  let backendModule;
  const io = new Server(httpServer, {
    serveClient: false,
    cors: {
      origin: '*',
    },
  });
  io.on('connection', wrapSocketErrors((socket) => {
    socket.emit('stateChanged', filterRoomState(roomState));
  }));

  const startGame = async () => {
    backendModule = await getLatestBackendModule(userBackend);
    if (backendModule == null) {
      return;
    }
    if (typeof backendModule.onRoomStart !== 'function') {
      logger.error("Unable to start game because 'onRoomStart' function is not exported!");
      return;
    }
    roomState = onRoomStart(logger, backendModule.onRoomStart);
    playerIdCounter = 0;
    io.sockets.emit('stateChanged', filterRoomState(roomState));
  };

  const restartGame = async () => {
    logger.info('Resetting game state with new backend.');
    logger.info('Closing player tabs.');
    await startGame();
  };

  // setup a watch to detect when we should refresh the backend module
  watchFile(userBackend, { interval: backendHotReloadIntervalMs }, () => {
    logger.info('Triggering hot reload due to change detected in:', userBackend);
    restartGame().catch((error) => {
      logger.error(error);
    });
  });

  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    if (backendModule == null) {
      throw new Error(`Could not load backend module for: ${userBackend}`);
    }
    next();
  });

  app.post('/player', (_, res) => {
    const username = `user_${playerIdCounter}`;
    const id = `id_${playerIdCounter}`;
    const player = {
      id, username,
    };
    const roomStateContender = onPlayerJoin(
      logger,
      player,
      roomState,
      backendModule.onPlayerJoin,
    );
    io.sockets.emit('stateChanged', filterRoomState(roomStateContender));
    roomState = roomStateContender;
    playerIdCounter += 1;
    res.status(StatusCodes.OK).json(player);
  });

  app.delete('/player/:id', (req, res) => {
    const { id } = req.params;
    const player = getPlayerById(id, roomState);
    if (player === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
      return;
    }
    const roomStateContender = onPlayerQuit(logger, player, roomState, backendModule.onPlayerQuit);
    io.sockets.emit('stateChanged', filterRoomState(roomStateContender));
    roomState = roomStateContender;
    res.sendStatus(StatusCodes.OK);
  });

  app.post('/player/:id/move', (req, res) => {
    const { id } = req.params;
    const player = getPlayerById(id, roomState);
    if (player === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
      return;
    }
    try {
      const move = req.body;
      const roomStateContender = onPlayerMove(
        logger,
        move,
        player,
        roomState,
        backendModule.onPlayerMove,
      );
      io.sockets.emit('stateChanged', filterRoomState(roomStateContender));
      roomState = roomStateContender;
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      logger.error('Error in while making move:', err);
      res.status(StatusCodes.BAD_REQUEST).json({
        name: 'CreatorError',
        creatorError: {
          name: err.name,
          message: err.message,
        },
      });
    }
  });

  app.get('/state', (req, res) => {
    res.status(StatusCodes.OK).json(filterRoomState(roomState));
  });

  // Duplicated from @urturn/server GET /instance/date endpoint
  app.get('/date', (req, res) => {
    res.status(StatusCodes.OK).json({ date: new Date().toISOString() });
  });

  app.post('/state', (req, res) => {
    let roomStateContender;

    try {
      roomStateContender = deepCopy(req.body);
      validateRoomState(roomStateContender);
      playerIdCounter = 0;
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
      return;
    }

    io.sockets.emit('stateChanged', filterRoomState(roomStateContender));
    roomState = roomStateContender;
    res.sendStatus(StatusCodes.OK);
  });

  app.put('/state/refresh', (req, res) => {
    restartGame().then(() => {
      res.sendStatus(StatusCodes.OK);
    }).catch((err) => {
      logger.error(err);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  app.use((err, _, res, next) => {
    // log error for developers so they can see any potential errors on the backendModule for
    // functions related to onRoomStart, onPlayerJoin, and onPlayerQuit
    const { message = 'Error: unknown message' } = err;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
    next();
  });

  const server = httpServer.listen(apiPort);
  const url = `http://localhost:${apiPort}`;
  logger.info(`api server at ${url}`);

  startGame();
  return () => server.close();
}

export default setupServer;
