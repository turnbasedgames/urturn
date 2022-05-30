const { CREATOR_EDITABLE_FIELDS } = require('../src/boardGame');

module.exports = {
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
    return CREATOR_EDITABLE_FIELDS.reduce((prev, field) => {
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
