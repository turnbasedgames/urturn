// TicTacToe Example

function getPlrToMove(board, plrs) {
  const { xCount, oCount } = board.reduce((curCounts, row) => row.reduce(
    ({ xCount: x, oCount: o }, mark) => {
      if (mark === 'X') {
        return { xCount: x + 1, o };
      } if (mark === 'O') {
        return { oCount: o + 1, x };
      }
      return { xCount, oCount };
    },
    curCounts,
  ), { xCount: 0, oCount: 0 });

  if (xCount === oCount) {
    return plrs[0];
  }
  return plrs[1];
}

function getPlrMark(plr, plrs) {
  if (plr === plrs[0]) {
    return 'X';
  }
  return 'O';
}

function getPlrFromMark(mark, plrs) {
  return mark === 'X' ? plrs[0] : plrs[1];
}

function isWinningSequence(arr) {
  return arr[0] != null && arr[0] === arr[1] && arr[1] === arr[2];
}

function isEndGame(board, plrs) {
  // check if there is a winner
  for (let i = 0; i < board.length; i += 1) {
    const row = board[i];
    const col = [board[0][i], board[1][i], board[2][i]];

    if (isWinningSequence(row)) {
      return [true, getPlrFromMark(row[0], plrs)];
    } if (isWinningSequence(col)) {
      return [true, getPlrFromMark(col[0], plrs)];
    }
  }

  const d1 = [board[0][0], board[1][1], board[2][2]];
  const d2 = [board[0][2], board[1][1], board[2][0]];
  if (isWinningSequence(d1)) {
    return [true, getPlrFromMark(d1[0], plrs)];
  } if (isWinningSequence(d2)) {
    return [true, getPlrFromMark(d2[0], plrs)];
  }

  // check for tie
  if (board.some((row) => row.some((mark) => mark === null))) {
    return [false, null];
  }
  return [true, null];
}

/**
 * Generic board game types
 * @type BoardGame: json object, in the format of
 * {
 *  // creator read write fields
 *  state: json object, which represents any board game state
 *  joinable: boolean (default=true), whether or not the room can have new players added to it
 *  finished: boolean (default=false), when true there will be no new board game state changes
 *
 *  // creator read only
 *  players: [string], array of unique playerIds
 *  version: Number, an integer value that increases by 1 with each state change
 * }
 * @type BoardGameResult: json object, in the format of
 * {
 *  // fields that creator wants to overwrite
 *  state?: json object, which represents any board game state
 *  joinable?: boolean, whether or not the room can have new players added to it
 *  finished?: boolean, when true there will be no new board game state changes
 * }
 */

/**
 * onRoomStart
 * @returns {BoardGameResult}
 */
function onRoomStart() {
  return {
    state: {
      state: 'NOT_STARTED', // NOT_STARTED, IN_GAME
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      winner: null, // null means tie if game is finished, otherwise set to the plr that won
    },
  };
}

/**
 * onPlayerJoin
 * @param {string} plr string, which represents the player id
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerJoin(plr, boardGame) {
  const { players, state } = boardGame;

  // VALIDATIONS
  // check if game has started
  if (state.state !== 'NOT_STARTED') {
    throw new Error("game has already started, can't join the game!");
  }

  // TRANSFORMATIONS
  // determine if we should start the game
  if (players.length === 2) {
    // start game
    state.state = 'IN_GAME';
    return {
      state,
      joinable: false,
    };
  }
  return {
    state,
    joinable: true,
  };
}

/**
 * onPlayerMove
 * @param {string} plr string, which represents the player id
 * @param {*} move json object, controlled the creator that represents the player's move
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerMove(plr, move, boardGame) {
  const { state, players } = boardGame;
  const { board } = state;

  // VALIDATIONS
  // boardgame must be in the game
  const { x, y } = move;
  if (state.state !== 'IN_GAME') {
    throw new Error("game is not in progress, can't make move!");
  }
  if (getPlrToMove(board, players) !== plr) {
    throw new Error(`Its not this player's turn: ${plr}`);
  }
  if (board[x][y] !== null) {
    throw new Error(`Invalid move, someone already marked here: ${x},${y}`);
  }

  const plrMark = getPlrMark(plr, players);
  board[x][y] = plrMark;

  // Check if game is over
  const [isEnd, winner] = isEndGame(board, players);
  if (isEnd) {
    state.winner = winner;
    return { state, finished: true };
  }
  return { state };
}

/**
 * onPlayerQuit
 * @param {string} plr string, which represents the player id
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerQuit(plr, boardGame) {
  const { state, players } = boardGame;
  if (players.length === 1) {
    const [winner] = players.filter((playerId) => playerId !== plr)[0];
    state.winner = winner;
    return { state, joinable: false, finished: true };
  }
  return { joinable: false, finished: true };
}

module.exports = {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};
