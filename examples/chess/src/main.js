import { Chess } from 'chess.js';
import { Color } from './util.js';

function onRoomStart(roomState) {
  return {
    state: {
      plrIdToColor: {},
      // string representation of the board https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
      fen: null,
      winner: null,
    },
  };
}

function onPlayerJoin(player, roomState) {
  const { players, state } = roomState;
  if (players.length === 2) {
    const game = new Chess();
    state.fen = game.fen();
    // default first player to white to simplify
    state.plrIdToColor[players[0].id] = Color.White;
    state.plrIdToColor[players[1].id] = Color.Black;
    return { joinable: false, state };
  }
  return {};
}

function onPlayerQuit(player, roomState) {
  const { state, players } = roomState;
  if (players.length === 1) {
    const [winner] = players;
    state.winner = winner;
    return { state, finished: true };
  }
  return { joinable: false, finished: true };
}

function onPlayerMove(player, move, roomState) {
  const { state } = roomState;
  const { fen } = state;
  if (fen == null) {
    throw new Error('FEN string is null!');
  }
  const game = new Chess(fen);
  const result = game.move(move);
  if (result == null) {
    throw new Error('Invalid chess move!');
  }
  state.fen = game.fen();

  if (game.isGameOver()) {
    if (game.isCheckmate()) {
      state.winner = player;
    }
    return { state, finished: true };
  }

  return { state };
}

// Export these functions so UrTurn runner can run these functions whenever the associated event
// is triggered. Follow an example flow of events: https://docs.urturn.app/docs/Introduction/Flow-Of-Simple-Game
export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerQuit,
  onPlayerMove,
};
