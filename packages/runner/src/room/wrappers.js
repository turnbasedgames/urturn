import { filterRoomState, applyRoomStateResult } from './roomState';

function onPlayerJoin(logger, player, roomState, innerFn) {
  // pre fn logic
  roomState.players.push(player);

  // call the user fn
  const roomStateResult = innerFn(
    player,
    {
      ...JSON.parse(JSON.stringify(filterRoomState(roomState))),
      logger,
    },
  );

  // post fn logic
  const newRoomState = applyRoomStateResult(roomState, roomStateResult);
  newRoomState.version += 1;
  return newRoomState;
}

export default {
  onPlayerJoin,
};
