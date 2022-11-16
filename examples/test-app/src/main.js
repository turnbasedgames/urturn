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
  onPlayerJoin: ({ username }, roomState) => ({
    state: {
      message: `${username} joined!`,
      last: filterOutEntries(roomState, BACKEND_ONLY_FIELDS),
    },
  }),
  onPlayerMove: ({ username }, move, roomState) => {
    roomState.logger.info('test app: onPlayerMove called', { username, move, roomState });
    // move.error triggers an error to be thrown immediately for testing purposes
    const { error } = move;
    if (error) {
      roomState.logger.error('test app:', error);
      throw new Error(error);
    }
    // This is duplicated from src/roomState.js CREATOR_EDITABLE_FIELDS
    // TODO: we can use that variable if this file turns into an es6 file
    return ['joinable', 'finished', 'state'].reduce((prev, field) => {
      if (field in move) {
        // allow a move to change any CREATOR_EDITABLE_FIELD for testing
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
  onPlayerQuit: ({ username }, roomState) => ({
    state: {
      message: `${username} left!`,
      last: filterOutEntries(roomState, BACKEND_ONLY_FIELDS),
    },
  }),
};
