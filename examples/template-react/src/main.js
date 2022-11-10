// tip: docs @ https://docs.urturn.app/docs/API/backend#functions
// TODO:KEVIN docs for walkthrough on template files
// TODO:WHYTF IS CRA NOT WORKIING

function onRoomStart() {
  // TODO: implement what the state of the room looks like initially
  console.log('Start called')
  const state = {}
  return { state }
}

function onPlayerJoin(player, roomState) {
  // TODO: implement how to change the roomState when a player joins
  console.log('Join called with:', { player, roomState })
  return {}
}

function onPlayerQuit(player, roomState) {
  // TODO: implement how to change the roomState when a player quits the room
  console.log('Quit called with:', { player, roomState })
  return {}
}

function onPlayerMove(player, move, roomState) {
  // TODO: implement how to change the roomState when any player makes a move
  console.log('Move called with:', { player, move, roomState })
  return {}
}

// Export these functions so UrTurn runner can run these functions whenever the associated event
// is triggered. Follow an example flow of events: https://docs.urturn.app/docs/Introduction/Flow-Of-Simple-Game
export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerQuit,
  onPlayerMove,
};
