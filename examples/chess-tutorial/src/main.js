import { Chess } from 'chess.js';

const Color = Object.freeze({
  Black: 'black',
  White: 'white',
});

function onRoomStart() {
  return {
    state: {
      plrIdToColor: {},
      // string representation of the board https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
      fen: null,
      winner: null,
      lastMovedSquare: null,
    },
  };
}

function onPlayerJoin() {
  // TODO: implement what to do when player joins game
  return {};
}

function onPlayerQuit() {
  // TODO: handle when player quits the game before it finishes
  return {};
}

function onPlayerMove() {
  // TODO: handle any client triggered events
  return {};
}

// Export these functions so UrTurn runner can run these functions whenever the associated event
// is triggered. Follow an example flow of events: https://docs.urturn.app/docs/Introduction/Flow-Of-Simple-Game
export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerQuit,
  onPlayerMove,
};
