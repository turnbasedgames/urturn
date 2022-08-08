module.export = {
  onRoomStart: () => ({
    state: {
      message: 'room start!',
    },
  }),
  onPlayerJoin: ({ username }, boardGame) => ({
    state: {
      message: `${username} joined!`,
      last: boardGame,
    },
  }),
  onPlayerMove: ({ username }, move, boardGame) => {
    // move.error triggers an error to be thrown immediately for testing purposes
    const { error } = move;
    if (error) {
      throw new Error(error);
    }
    // This is duplicated from src/boardGame.js CREATOR_EDITABLE_FIELDS
    // TODO: we can use that variable if this file turns into an es6 file
    return ['joinable', 'finished', 'state'].reduce((prev, field) => {
      if (move[field]) {
        // allow a move to change any CREATOR_EDITABLE_FIELD for testing
        return { ...prev, [field]: move[field] };
      }
      return prev;
    }, {
      state: {
        message: `${username} made move!`,
        move,
        last: boardGame,
      },
    });
  },
  onPlayerQuit: ({ username }, boardGame) => ({
    state: {
      message: `${username} left!`,
      last: boardGame,
    },
  }),
};
