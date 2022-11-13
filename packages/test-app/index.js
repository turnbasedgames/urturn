export default {
  onRoomStart: () => ({
    state: {
      message: 'room start!',
    },
  }),
  onPlayerJoin: ({ username }, roomState) => ({
    state: {
      message: `${username} joined!`,
      last: roomState,
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
        last: roomState,
      },
    });
  },
  onPlayerQuit: ({ username }, roomState) => ({
    state: {
      message: `${username} left!`,
      last: roomState,
    },
  }),
};
