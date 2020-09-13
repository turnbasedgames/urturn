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
    const winner = this.getWinner();
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

  removePlayer(plr) {

  }

  isAbleToStart() {
    return this.state === GAME_STATE.NOT_STARTED
      && this.players
      && this.players.length === 2;
  }

  isEndGame() {
  }

  getPlayerPosition(plr) {
    return this.players.findIndex((p) => plr.id === p.id);
  }

  getWinner() {

  }
}

module.exports = Game;
