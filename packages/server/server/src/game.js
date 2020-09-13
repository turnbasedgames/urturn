const logger = require('./logger');
const { shuffleArray } = require('./util');

const SPOT_STATE = Object.freeze({
  EMPTY: null,
  X: 'X',
  O: 'O',
});

const GAME_STATE = Object.freeze({
  NOT_STARTED: 1,
  IN_GAME: 2,
  ENDED: 3,
});

class Game {
  constructor() {
    this.players = [];
    this.waitingOn = null;
    this.state = GAME_STATE.NOT_STARTED;
  }

  makeMove(plr, move) {
    if (this.getPlayerPosition(plr) !== this.waitingOn) {
      return;
    }
    if (move.i < 0 || move.i > 2 || move.j < 0 || move.j > 2) {
      return;
    }
    if (this.board[move.i][move.j] !== SPOT_STATE.EMPTY) {
      return;
    }

    const moveValue = ['X', 'O'][this.waitingOn];
    this.board[move.i][move.j] = SPOT_STATE[moveValue];
    this.waitingOn += 1;
    this.waitingOn %= 2;

    this.players.forEach((p) => {
      p.ws.send(JSON.stringify({
        type: 'plr.move',
        move,
      }));
    });

    logger.info(JSON.stringify(this.board, null, 2));
    logger.info(this.waitingOn);

    if (this.isEndGame()) {
      this.endGame();
    }
  }

  startGame() {
    this.board = [
      [SPOT_STATE.EMPTY, SPOT_STATE.EMPTY, SPOT_STATE.EMPTY],
      [SPOT_STATE.EMPTY, SPOT_STATE.EMPTY, SPOT_STATE.EMPTY],
      [SPOT_STATE.EMPTY, SPOT_STATE.EMPTY, SPOT_STATE.EMPTY],
    ];
    this.state = GAME_STATE.IN_GAME;
    this.waitingOn = 0;
    this.players = shuffleArray(this.players);

    const playersJSON = this.players.map((plr) => plr.toJSON());
    this.players.forEach((plr) => {
      plr.ws.send(JSON.stringify({
        type: 'game.start',
        board: this.board,
        players: playersJSON,
      }));
    });
  }

  endGame() {
    this.state = GAME_STATE.ENDED;
    let winner = this.getWinner();
    if (winner) {
      winner = this.players[winner === SPOT_STATE.X ? 0 : 1];
    }
    this.players.forEach((plr) => {
      plr.ws.send(JSON.stringify({
        type: 'game.end',
        winner,
      }));
    });
  }

  addPlayer(plr) {
    this.players.push(plr);
  }

  isAbleToStart() {
    return this.state === GAME_STATE.NOT_STARTED
      && this.players
      && this.players.length === 2;
  }

  isEndGame() {
    if (this.getWinner()) {
      return true;
    }

    for (let i = 0; i < this.board.length; i += 1) {
      for (let j = 0; j < this.board[i].length; j += 1) {
        if (this.board[i][j] === SPOT_STATE.EMPTY) {
          return false;
        }
      }
    }
    return true;
  }

  getPlayerPosition(plr) {
    return this.players.findIndex((p) => plr.id === p.id);
  }

  getWinner() {
    for (let i = 0; i < 3; i += 1) {
      if (this.board[i][0] !== SPOT_STATE.EMPTY
        && this.board[i][0] === this.board[i][1]
        && this.board[i][1] === this.board[i][2]) {
        return this.board[i][0];
      }
      if (this.board[0][i] !== SPOT_STATE.EMPTY
        && this.board[0][i] === this.board[1][i]
        && this.board[1][i] === this.board[2][i]) {
        return this.board[0][i];
      }
    }
    if (this.board[0][0] !== SPOT_STATE.EMPTY
      && this.board[0][0] === this.board[1][1]
      && this.board[1][1] === this.board[2][2]) {
      return this.board[0][0];
    }
    if (this.board[2][0] !== SPOT_STATE.EMPTY
      && this.board[2][0] === this.board[1][1]
      && this.board[1][1] === this.board[0][2]) {
      return this.board[2][0];
    }
    return null;
  }
}

module.exports = Game;
