import jsChessEngine from 'js-chess-engine';

const game = new jsChessEngine.Game();

function onRoomStart(roomState) {
  return {
    state: {
      board: null,
    },
  };
}

function onPlayerJoin(player, roomState) {
  const { players, state } = roomState;
  if (players === 2) {
    return { joinable: false };
  }
  return {};
}

function onPlayerQuit(player, roomState) {
  const { logger } = roomState;
  logger.info('Quit called with:', { player, roomState });
  logger.warn('TODO: implement how to change the roomState when a player quits the room');
  return {};
}

function onPlayerMove(player, move, roomState) {
  const { logger } = roomState;
  logger.info('Move called with:', { player, move, roomState });
  logger.warn('TODO: implement how to change the roomState when any player makes a move');
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
