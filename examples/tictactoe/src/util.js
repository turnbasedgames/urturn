export const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

export const Mark = Object.freeze({
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
export const evaluateBoard = (board, plrIdToPlrMark, players) => {
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
