import express from 'express';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { watchFile } from 'fs';
import { userBackend } from '../config/paths.js';
import {
  newBoardGame, applyBoardGameResult, filterBoardGame, getPlayerById, removePlayerById,
  validateBoardGame,
} from './boardGame.js';
import requireUtil from './requireUtil.cjs';

const spectatorId = 'spectator';
const backendHotReloadIntervalMs = 100;

const getLatestBackendModule = async (backendPath) => {
  try {
    // Nodejs doesn't support cache busting interface yet for esm https://github.com/nodejs/help/issues/2806
    // This is a workaround to get a completely fresh backendModule, as the query
    // will be new every millisecond. When the issue gets resolved we should use the
    // interface to delete old cache entries. This workaround causes a memory leak where
    // old cached modules never cleaned up.
    const cacheBustingModulePath = `${backendPath}?update=${Date.now()}`;
    const { default: backendModule } = await import(cacheBustingModulePath);

    // the cacheBusting workaround for esm modules does not work for commonjs
    requireUtil.cleanupCommonJSModule(backendPath);

    return backendModule;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

async function setupServer({ apiPort }) {
  const app = express();
  const httpServer = createServer(app);
  let boardGame;
  let backendModule;
  const io = new Server(httpServer, {
    serveClient: false,
    cors: {
      origin: '*',
    },
  });
  io.on('connection', (socket) => {
    socket.emit('stateChanged', boardGame);
  });

  const startGame = async () => {
    backendModule = await getLatestBackendModule(userBackend);
    if (backendModule == null) {
      return;
    }
    if (typeof backendModule.onRoomStart !== 'function') {
      console.error("Unable to start game because 'onRoomStart' function is not exported!");
      return;
    }
    boardGame = newBoardGame(backendModule);
    io.sockets.emit('stateChanged', boardGame);
  };

  const restartGame = async () => {
    console.log('Resetting game state with new backend.');
    console.log('Closing player tabs.');
    await startGame();
  };

  // setup a watch to detect when we should refresh the backend module
  watchFile(userBackend, { interval: backendHotReloadIntervalMs }, () => {
    console.log('Triggering hot reload due to change detected in:', userBackend);
    restartGame();
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
    let boardGameContender = JSON.parse(JSON.stringify(boardGame));
    if (!boardGameContender.joinable) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot add player to this room because it is not joinable (boardGame.joinable=${boardGameContender.joinable}).` });
      return;
    }

    const username = `user_${boardGame.playerIdCounter}`;
    const id = `id_${boardGame.playerIdCounter}`;
    const player = {
      id, username,
    };
    boardGameContender.playerIdCounter += 1;
    boardGameContender.players.push(player);
    boardGameContender = applyBoardGameResult(
      boardGameContender,
      backendModule.onPlayerJoin(player, filterBoardGame(boardGameContender)),
    );
    io.sockets.emit('stateChanged', boardGameContender);
    boardGame = boardGameContender;
    res.status(StatusCodes.OK).json(player);
  });

  app.delete('/player/:id', (req, res) => {
    const { id } = req.params;
    const player = getPlayerById(id, boardGame);
    if (player === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
      return;
    }
    let boardGameContender = JSON.parse(JSON.stringify(boardGame));
    boardGameContender = removePlayerById(id, boardGameContender);
    boardGameContender = applyBoardGameResult(
      boardGameContender,
      backendModule.onPlayerQuit(player, filterBoardGame(boardGameContender)),
    );
    io.sockets.emit('stateChanged', boardGameContender);
    boardGame = boardGameContender;
    res.sendStatus(StatusCodes.OK);
  });

  app.post('/player/:id/move', (req, res) => {
    const { id } = req.params;
    let boardGameContender = JSON.parse(JSON.stringify(boardGame));
    const player = getPlayerById(id, boardGameContender);
    if (player === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
      return;
    }
    const move = req.body;
    try {
      boardGameContender = applyBoardGameResult(
        boardGameContender,
        backendModule.onPlayerMove(player, move, filterBoardGame(boardGameContender)),
      );
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({
        name: 'CreatorError',
        creatorError: {
          name: err.name,
          message: err.message,
        },
      });
      return;
    }
    io.sockets.emit('stateChanged', boardGameContender);
    boardGame = boardGameContender;
    res.sendStatus(StatusCodes.OK);
  });

  app.get('/state', (req, res) => {
    res.status(StatusCodes.OK).json(filterBoardGame(boardGame));
  });

  app.post('/state', (req, res) => {
    let boardGameContender;

    try {
      boardGameContender = JSON.parse(JSON.stringify(req.body));
      validateBoardGame(boardGameContender);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
      return;
    }

    io.sockets.emit('stateChanged', boardGameContender);
    boardGame = boardGameContender;
    res.sendStatus(StatusCodes.OK);
  });

  app.put('/state/refresh', (req, res) => {
    restartGame().then(() => {
      res.sendStatus(StatusCodes.OK);
    }).catch((err) => {
      console.error(err);
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
  console.log(`api server at ${url}`);

  startGame();
  return () => server.close();
}

export default setupServer;
