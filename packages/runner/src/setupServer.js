const express = require('express');
const { StatusCodes } = require('http-status-codes');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const defaultBackendModule = require('../test_app/index');
const {
  userBackend,
} = require('../config/paths');
const {
  newBoardGame, applyBoardGameResult, filterBoardGame, getPlayerById, removePlayerById,
} = require('./boardGame');

// TODO: MAIN-89 hot reload based on backendModule changes
module.exports = {
  setupServer({ isEmptyBackend, apiPort }) {
    let backendModule = defaultBackendModule;
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
      const username = `user_${boardGame.playerIdCounter}`;
      const id = `id_${boardGame.playerIdCounter}`;
      const player = {
        id, username,
      };
      boardGame.playerIdCounter += 1;
      boardGame.players.push(player);
      boardGame = applyBoardGameResult(
        boardGame,
        backendModule.onPlayerJoin(player, filterBoardGame(boardGame)),
      );
      io.sockets.emit('stateChanged', boardGame);
      res.status(StatusCodes.OK).json(player);
    });

    app.delete('/player/:id', (req, res) => {
      const { id } = req.params;
      const player = getPlayerById(id, boardGame);
      if (player === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
        return;
      }
      boardGame = removePlayerById(id, boardGame);
      boardGame = applyBoardGameResult(
        boardGame,
        backendModule.onPlayerQuit(player, filterBoardGame(boardGame)),
      );
      io.sockets.emit('stateChanged', boardGame);
      res.sendStatus(StatusCodes.OK);
    });

    app.post('/player/:id/move', (req, res) => {
      const { id } = req.params;
      const player = getPlayerById(id, boardGame);
      if (player === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
        return;
      }
      const move = req.body;
      try {
        boardGame = applyBoardGameResult(
          boardGame,
          backendModule.onPlayerMove(player, move, filterBoardGame(boardGame)),
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
      io.sockets.emit('stateChanged', boardGame);
      res.sendStatus(StatusCodes.OK);
    });

    app.get('/state', (req, res) => {
      res.status(StatusCodes.OK).json(filterBoardGame(boardGame));
    });

    app.delete('/state', (req, res) => {
      boardGame = newBoardGame(backendModule);
      res.sendStatus(StatusCodes.OK);
    });

    const server = httpServer.listen(apiPort);
    const url = `http://localhost:${apiPort}`;
    console.log(`api server at ${url}`);
    return () => server.close();
  },
};
