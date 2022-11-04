// TicTacToe Example
const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

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
 * @type Player: json object, in the format of
 * {
 *  id: string, unique player id
 *  username: string, the player's display name
 * }
 * @type BoardGame: json object, in the format of
 * {
 *  // creator read write fields
 *  state: json object, which represents any board game state
 *  joinable: boolean (default=true), whether or not the room can have new players added to it
 *  finished: boolean (default=false), when true there will be no new board game state changes
 *
 *  // creator read only
 *  players: [Player], array of player objects
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
      status: Status.PreGame,
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      winner: null, // null means tie if game is finished, otherwise set to the plr that won,
    },
  };
}

/**
 * onPlayerJoin
 * @param {Player} player, represents the player that is attempting to join this game
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerJoin(player, roomState) {
  const { players, state } = roomState;
  if (players.length === 2) { // enough players to play the game
    state.status = Status.InGame;
    state.plrToMoveIndex = 0; // keep track of who’s turn it is
    return { // return modifications we want to make to the roomState
      state,
      // we should not allow new players to join the game, tictactoe only needs two players
      joinable: false,
    };
  }
  // our first player joined, we should do nothing (not enough players yet to start).
  return {};
}

/**
 * onPlayerMove
 * @param {Player} player, the player that is attempting to make a move
 * @param {*} move json object, controlled the creator that represents the player's move
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerMove(player, move, boardGame) {
  const { state, players } = boardGame;
  const { board, plrToMoveIndex } = state;

  // VALIDATIONS
  // boardgame must be in the game
  const { x, y } = move;
  if (state.status !== Status.InGame) {
    throw new Error("game is not in progress, can't make move!");
  }
  if (players[plrToMoveIndex].id !== player.id) {
    throw new Error(`Its not this player's turn: ${player.username}`);
  }
  if (board[x][y] !== null) {
    throw new Error(`Invalid move, someone already marked here: ${x},${y}`);
  }

  const plrMark = player.id === players[0] ? 'X' : 'O';
  board[x][y] = plrMark;

  // Check if game is over
  const [isEnd, winner] = isEndGame(board, players);
  if (isEnd) {
    state.status = Status.EndGame;
    state.winner = winner;
    return { state, finished: true };
  }

  state.plrToMoveIndex = plrToMoveIndex === 0 ? 1 : 0;
  return { state };
}

/**
 * onPlayerQuit
 * @param {Player} player, the player that is attempting to quit the game
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerQuit(player, boardGame) {
  const { state, players } = boardGame;
  state.status = Status.EndGame;
  if (players.length === 1) {
    const [winner] = players;
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
