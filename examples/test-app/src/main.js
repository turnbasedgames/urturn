import { ROOM_STATE_EDITABLE_FIELDS } from '@urturn/types-common';

// these roomState fields should be filtered out
const BACKEND_ONLY_FIELDS = ['logger'];

const filterOutEntries = (obj, keys) => Object
  .fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));

export default {
  onRoomStart: ({ logger }) => {
    logger.info('test app: room start');
    return {
      state: {
        message: 'room start!',
      },
    };
  },
  onPlayerJoin: ({ username }, roomState) => {
    roomState.logger.info('test app: onPlayerJoin called', { username, roomState });
    return {
      state: {
        message: `${username} joined!`,
        last: filterOutEntries(roomState, BACKEND_ONLY_FIELDS),
      },
    };
  },
  onPlayerMove: ({ username }, move, roomState) => {
    roomState.logger.info('test app: onPlayerMove called', { username, move, roomState });
    // move.error triggers an error to be thrown immediately for testing purposes
    const { error } = move;
    if (error) {
      roomState.logger.error('test app:', error);
      throw new Error(error);
    }
    return ROOM_STATE_EDITABLE_FIELDS.reduce((prev, field) => {
      if (field in move) {
        // allow a move to change any ROOM_STATE_EDITABLE_FIELDS for testing
        return { ...prev, [field]: move[field] };
      }
      return prev;
    }, {
      state: {
        message: `${username} made move!`,
        move,
        last: filterOutEntries(roomState, BACKEND_ONLY_FIELDS),
      },
    });
  },
  onPlayerQuit: ({ username }, roomState) => {
    roomState.logger.info('test app: onPlayerQuit called', { username, roomState });
    return {
      state: {
        message: `${username} left!`,
        last: filterOutEntries(roomState, BACKEND_ONLY_FIELDS),
      },
    };
  },
  onTimeout: (roomState) => {
    roomState.logger.info('test app: onTimeout called', { roomState });
    return {
      state: {
        message: 'onTimeout Triggered!',
        last: filterOutEntries(roomState, BACKEND_ONLY_FIELDS),
      },
    };
  },
};
