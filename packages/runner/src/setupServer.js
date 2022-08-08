import express from 'express';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { userBackend } from '../config/paths.js';
import {
  newBoardGame, applyBoardGameResult, filterBoardGame, getPlayerById, removePlayerById,
  validateBoardGame,
} from './boardGame.js';

// TODO: MAIN-89 hot reload based on backendModule changes
async function setupServer({ isEmptyBackend, apiPort }) {
  // eslint-disable-next-line global-require
  let backendModule = require('../test_app/index.cjs');
  if (!isEmptyBackend) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    backendModule = require(userBackend);
  }

  // State that is being tracked for any operation (e.g. make move, add player)
  let boardGame = newBoardGame(backendModule);

  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    serveClient: false,
    cors: {
      origin: '*',
    },
  });
  io.on('connection', (socket) => {
    socket.emit('stateChanged', boardGame);
  });

  app.use(cors());
  app.use(express.json());

  app.post('/player', (_, res) => {
    let boardGameContender = JSON.parse(JSON.stringify(boardGame));
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

  app.delete('/state', (req, res) => {
    boardGame = newBoardGame(backendModule);
    res.sendStatus(StatusCodes.OK);
  });

  app.use((err, req, res) => {
    // log error for developers so they can see any potential errors on the backendModule for
    // functions related to onRoomStart, onPlayerJoin, and onPlayerQuit
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
  });

  const server = httpServer.listen(apiPort);
  const url = `http://localhost:${apiPort}`;
  console.log(`api server at ${url}`);
  return () => server.close();
}

export default setupServer;
