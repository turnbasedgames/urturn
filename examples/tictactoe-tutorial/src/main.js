import { Status, Mark, evaluateBoard } from './util';

function onRoomStart() {
  const state = {
    /**
     * TODO: define initial values for the following:
     * - status
     * - plrIdToPlrMark
     * - plrMoveIndex
     * - board
     * - winner
     */
  };
  return { state };
}

function onPlayerJoin(player, roomState) {
  const { players, state } = roomState;
  if (players.length === 2) { // enough players to play the game
    // TODO: modify state to start the game
    return {
      // TODO: tell UrTurn to NOT allow anymore players in this room
      // TODO: return the modified state
    };
  }

  // still waiting on another player so make no modifications
  return {};
}

function onPlayerMove(player, move, roomState) {
  const { state, players, logger } = roomState;
  const { plrMoveIndex, plrIdToPlrMark } = state;
  const { x, y } = move;

  // TODO: validate player move and throw sensible error messages
  // 1. what if a player tries to make a move when the player is not in game?
  // 2. what if a player makes a move and its not their turn?
  // 3. what if a player makes a move on the board where there was already a mark?
  // TODO: mark the board

  // check if the game is finished
  const result = evaluateBoard(state.board, plrIdToPlrMark, players);
  if (result?.finished) {
    // TODO: handle different cases when game is finished, using the values calculated from
    // evaluateBoard() call
    return {
      // TODO: include state modifications so UrTurn updates the state
      // TODO: tell UrTurn that the room is finished, which lets UrTurn display the room correctly
    };
  }

  // TODO: Set the plr to move to the next player (hint: update state.plrMoveIndex)
  return { state };
}

function onPlayerQuit(player, roomState) {
  const { state, players } = roomState;

  state.status = Status.EndGame;
  if (players.length === 1) {
    // TODO: when a player quits and there is another player, we should default the winner to
    // be the remaining player
    return {
      // TODO: properly tell UrTurn the room is over and no longer joinable
      // (hint: modify finished, joinable, state fields)
    };
  }
  return {
    // TODO: when a player quits and there was no other player, there is no winner but we should
    // properly tell UrTurn the room is over and no longer joinable
    // (hint: modify finished and joinable fields)
  };
}

export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};
