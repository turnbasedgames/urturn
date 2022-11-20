import { Status, Mark, evaluateBoard } from './util';

function onRoomStart() {
  return {
    state: {
      status: Status.PreGame,
      plrIdToPlrMark: {}, // map from plrId to their mark (X or O)
      plrMoveIndex: 0, // track who's move it is
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
  const { plrMoveIndex, plrIdToPlrMark } = state;
  const { x, y } = move;

  // validate player moves
  if (state.status !== Status.InGame) {
    throw new Error("game is not in progress, can't make move!");
  }
  if (players[plrMoveIndex].id !== player.id) {
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
  state.plrMoveIndex = (plrMoveIndex + 1) % 2;
  return { state };
}

function onPlayerQuit(player, roomState) {
  const { state, players } = roomState;
  state.status = Status.EndGame;
  if (players.length === 1) {
    const [winner] = players;
    state.winner = winner;
    return { state, joinable: false, finished: true };
  }
  return { joinable: false, finished: true };
}

export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};
