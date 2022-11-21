import { removePlayerById, filterRoomState, applyRoomStateResult } from './roomState';

function guardFinished(roomState) {
  if (roomState.finished) {
    throw new Error(`No more function calls because (roomState.finished=${roomState.finished})`);
  }
}

function guardJoinable(roomState) {
  if (!roomState.joinable) {
    throw new Error(`Cannot add player to this room because it is not joinable (roomState.joinable=${roomState.joinable}).`);
  }
}

function postRoomFunction(roomState) {
  const newRoomState = { ...roomState };
  if (newRoomState.finished) {
    newRoomState.joinable = false;
  }
  newRoomState.version += 1;
  return newRoomState;
}

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export function onRoomStart(logger, innerFn) {
  const roomState = {
    joinable: true,
    finished: false,
    players: [],
    version: 0,
    state: {},
    roomStartContext: { private: false },
  };
  const roomStateResult = innerFn.onRoomStart({ ...deepCopy(filterRoomState(roomState)), logger });
  return postRoomFunction(applyRoomStateResult(roomState, roomStateResult));
}

export const onPlayerJoin = (logger, player, roomState, innerFn) => {
  // pre fn logic
  guardFinished(roomState);
  guardJoinable(roomState);
  roomState.players.push(player);

  // call the user fn
  const roomStateResult = innerFn(
    deepCopy(filterRoomState(player)),
    {
      ...deepCopy(filterRoomState(roomState)),
      logger,
    },
  );

  // post fn logic
  const newRoomState = applyRoomStateResult(roomState, roomStateResult);
  return postRoomFunction(newRoomState);
};

export const onPlayerQuit = (logger, player, roomState, innerFn) => {
  // pre fn logic
  guardFinished(roomState);
  removePlayerById(player.id, roomState);

  // call the user fn
  const roomStateResult = innerFn(
    deepCopy(filterRoomState(player)),
    {
      ...deepCopy(filterRoomState(roomState)),
      logger,
    },
  );

  // post fn logic
  const newRoomState = applyRoomStateResult(roomState, roomStateResult);
  return postRoomFunction(newRoomState);
};

export const onPlayerMove = (logger, move, player, roomState, innerFn) => {
  // pre fn logic
  guardFinished(roomState);
  removePlayerById(player.id, roomState);

  // call the user fn
  const roomStateResult = innerFn(
    deepCopy(filterRoomState(player)),
    move,
    {
      ...deepCopy(filterRoomState(roomState)),
      logger,
    },
  );

  // post fn logic
  const newRoomState = applyRoomStateResult(roomState, roomStateResult);
  return postRoomFunction(newRoomState);
};
