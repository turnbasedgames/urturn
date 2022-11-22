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
  /**
   * TODO: check for a winner (hint: make sure the mark is not null)
   * - check rows
   * - check columns
   * - check diagonals
   */

  // TODO: check for tie and return correct result

  // TODO: return default not finished
};
