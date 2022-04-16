// TODO: MAIN-67 setup socket server
const express = require('express');
const { StatusCodes } = require('http-status-codes');
const cors = require('cors');
const {
  userBackend,
} = require('../config/paths');
const { newBoardGame, applyBoardGameResult, filterBoardGame } = require('./boardGame');

// TODO: MAIN-89 hot reload based on backendModule changes
module.exports = {
  setupServer(isEmptyBackend) {
    let backendModule = {
      onRoomStart: () => ({}),
      onPlayerJoin: () => ({}),
      onPlayerMove: () => ({}),
      onPlayerQuit: () => ({}),
    };
    if (!isEmptyBackend) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
      backendModule = require(userBackend);
    }
    console.log('loaded backend module', backendModule);

    // State that is being tracked for any operation (e.g. make move, add player)
    let boardGame = newBoardGame(backendModule);

    const app = express();
    app.use(cors());

    app.post('/player', (_, res) => {
      const playerId = `user_${boardGame.playerIdCounter}`;
      boardGame.playerIdCounter += 1;
      boardGame.players.push(playerId);
      boardGame = applyBoardGameResult(
        boardGame,
        backendModule.onPlayerJoin(playerId, filterBoardGame(boardGame)),
      );
      res.sendStatus(StatusCodes.OK);
    });

    app.delete('/player/:id', (req, res) => {
      const { id } = req.params;
      if (!boardGame.players.includes(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: `${id} is not in the board game` });
      }
      boardGame.players = boardGame.players.filter((p) => p.id !== id);
      boardGame = applyBoardGameResult(
        boardGame,
        backendModule.onPlayerQuit(id, filterBoardGame(boardGame)),
      );
      res.sendStatus(StatusCodes.OK);
    });

    app.post('/move', (req, res) => {
      const move = req.body;
      boardGame = applyBoardGameResult(
        boardGame,
        backendModule.onMove(move, filterBoardGame(boardGame)),
      );
      res.sendStatus(StatusCodes.OK);
    });

    app.get('/state', (req, res) => {
      res.status(StatusCodes.OK).json(filterBoardGame(boardGame));
    });

    app.delete('/room', (req, res) => {
      boardGame = newBoardGame(backendModule);
      res.sendStatus(StatusCodes.OK);
    });

    const server = app.listen(3000, () => {
      const url = `http://localhost:${server.address().port}`;
      console.log(`api server at ${url}`);
    });
  },
};
