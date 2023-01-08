import Joi from 'joi';
import { removePlayerById, filterRoomState, applyRoomStateResult } from './roomState.js';

// triggerTimeoutAt needs to be at least 10 seconds in the future
const MINIMUM_TRIGGER_TIMEOUT_MS = 10000;

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
  const roomStateResult = innerFn({ ...deepCopy(filterRoomState(roomState)), logger });
  return postRoomFunction(applyRoomStateResult(roomState, roomStateResult));
}

export const onPlayerJoin = (logger, player, roomState, innerFn) => {
  // pre fn logic
  guardFinished(roomState);
  guardJoinable(roomState);
  roomState.players.push(player);

  // call the user fn
  const roomStateResult = innerFn(
    deepCopy(player),
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
  let newRoomState = removePlayerById(player.id, roomState);

  // call the user fn
  const roomStateResult = innerFn(
    deepCopy(player),
    {
      ...deepCopy(filterRoomState(newRoomState)),
      logger,
    },
  );

  // post fn logic
  newRoomState = applyRoomStateResult(newRoomState, roomStateResult);
  return postRoomFunction(newRoomState);
};

export const onPlayerMove = (logger, move, player, roomState, innerFn) => {
  // pre fn logic
  guardFinished(roomState);
  removePlayerById(player.id, roomState);

  // call the user fn
  const roomStateResult = innerFn(
    deepCopy(player),
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

export const onTimeout = (logger, roomState, innerFn) => {
  // pre fn logic
  guardFinished(roomState);

  // call the user fn
  const roomStateResult = innerFn(
    {
      ...deepCopy(filterRoomState(roomState)),
      logger,
    },
  );

  const newRoomState = applyRoomStateResult(roomState, roomStateResult);
  return postRoomFunction(newRoomState);
};

export function updateRoomTimer(backendModule, roomState, timer, timeoutFn) {
  if (roomState.finished) {
    // reset the timer whenever a room is finished
    if (timer.timeoutId != null) {
      clearTimeout(timer.timeoutId);
      return {};
    }
  }
  if (roomState.triggerTimeoutAt == null) {
    // reset the timer whenever the trigger is cleared
    if (timer.timeoutId != null) {
      clearTimeout(timer.timeoutId);
    }
    return {};
  }
  if (roomState.triggerTimeoutAt !== timer.triggerTimeoutAt) {
    // clear existing timer
    if (timer.timeoutId != null) {
      clearTimeout(timer.timeoutId);
    }

    // throw error if timeout is not in ISO format
    Joi.assert(roomState.triggerTimeoutAt, Joi.string().isoDate(), 'roomState.triggerTimeoutAt must be an ISO string format!');

    // before setting timer, throw error if user did not define onTimeout function
    if (backendModule.onTimeout == null || typeof backendModule.onTimeout !== 'function') {
      throw new Error(`You must define onTimeout room function if you want to set "roomState.triggerTimeoutAt"! Instead we got onTimeout=${backendModule.onTimeout}`);
    }

    // new triggerTimeoutAt was set so we need to create a new timer
    const msLeft = Math.max(
      new Date(roomState.triggerTimeoutAt) - Date.now(),
      MINIMUM_TRIGGER_TIMEOUT_MS,
    );
    const timeoutId = setTimeout(() => {
      timeoutFn();
    }, msLeft);
    return {
      timeoutId,
      triggerTimeoutAt: roomState.triggerTimeoutAt,
    };
  }

  // become identity function if no change in roomState.triggerTimeoutAt detected
  return timer;
}
