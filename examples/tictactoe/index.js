'use strict';

const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

const Mark = Object.freeze({
  X: 'X',
  O: 'O',
});

/**
 * evaluateBoard() determines if the tictactoe game is finished and provides details (tie or winner)
 * @param {string[][]} board, a 3x3 2D array with 'X' and 'O' as values
 * @param {{[string]: string}} plrIdToPlrMark, map from plrId to the player's mark
 * @param {Player[]} players, list of players
 * @returns {
 *  winner?: Player, (the player that won the game if they exist)
 *  tie?: bool, (true if tie, and false if not a tie)
 *  finished: bool, (true if the game is finished, and false if not finished)
 * }
 */
const evaluateBoard = (board, plrIdToPlrMark, players) => {
  // calculate markToPlr map
  const [XPlayer, OPlayer] = plrIdToPlrMark[players[0].id] === Mark.X ? players : players.reverse();
  const markToPlr = {
    [Mark.X]: XPlayer,
    [Mark.O]: OPlayer,
  };

  // check for tie
  if (!board.some((row) => row.some((mark) => mark === null))) {
    return {
      finished: true,
      tie: true,
    };
  }

  const getIndexesFromLineNum = (num) => [num % 3, Math.floor(num / 3)];
  const possibleLineIndexes = [ // possible matching lines to check
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ].map((line) => line.map(getIndexesFromLineNum)); // convert line numbers to actual index pairs
  const winningLine = possibleLineIndexes.find((indexes) => {
    const [[firstI, firstJ]] = indexes;
    const firstMark = board[firstI][firstJ];
    const isSame = indexes.every(([i, j]) => board[i][j] === firstMark);
    return firstMark != null && isSame;
  });

  if (winningLine != null) { // winning line was found
    const [i, j] = winningLine[0];
    const mark = board[i][j];
    return { finished: true, winner: markToPlr[mark] };
  }

  return { finished: false };
};

function onRoomStart() {
  return {
    state: {
      status: Status.PreGame,
      plrIdToPlrMark: {}, // map from plrId to their mark (X or O)
      plrToMoveIndex: 0, // track who's move it is
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      winner: null,
    },
  };
}

function onPlayerJoin(player, roomState) {
  const { players, state } = roomState;
  if (players.length === 2) { // enough players to play the game
    // start the game and set the player's marks
    state.status = Status.InGame;
    state.plrIdToPlrMark[players[0].id] = Mark.X;
    state.plrIdToPlrMark[players[1].id] = Mark.O;
    // return modifications we want to make to the roomState
    return {
      state,
      // tell UrTurn to NOT allow anymore players in this room
      joinable: false,
    };
  }

  // still waiting on another player so make no modifications
  return {};
}

function onPlayerMove(player, move, roomState) {
  const { state, players } = roomState;
  const { plrToMoveIndex, plrIdToPlrMark } = state;
  const { x, y } = move;

  // validate player moves
  if (state.status !== Status.InGame) {
    throw new Error("game is not in progress, can't make move!");
  }
  if (players[plrToMoveIndex].id !== player.id) {
    throw new Error(`Its not this player's turn: ${player.username}`);
  }
  if (state.board[x][y] !== null) {
    throw new Error(`Invalid move, someone already marked here: ${x},${y}`);
  }

  // mark the board
  state.board[x][y] = plrIdToPlrMark[player.id];

  // check if the game is finished
  const { winner, tie, finished } = evaluateBoard(state.board, plrIdToPlrMark, players);
  if (finished) {
    state.status = Status.EndGame;
    state.winner = winner;
    state.tie = tie;
    // tell UrTurn that the room is finished, which let's UrTurn index rooms properly and display
    // finished rooms to players correctly
    return { state, finished: true };
  }

  // Set the plr to move to the next player
  state.plrToMoveIndex = (plrToMoveIndex + 1) % 2;
  return { state };
}

function onPlayerQuit(player, roomState) {
  const { state, players } = roomState;
  state.status = Status.EndGame;
  if (players.length === 1) {
    const [winner] = players;
    state.winner = winner;
    //
    return { state, joinable: false, finished: true };
  }
  return { joinable: false, finished: true };
}

var main = {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};

module.exports = main;
