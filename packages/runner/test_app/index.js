const { CREATOR_EDITABLE_FIELDS } = require('../src/boardGame');

module.exports = {
  onRoomStart: () => ({
    state: {
      message: 'room start!',
    },
  }),
  onPlayerJoin: (plr, boardGame) => ({
    state: {
      message: `${plr} joined!`,
      last: boardGame,
    },
  }),
  onPlayerMove: (plr, move, boardGame) => {
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
        message: `${plr} made move!`,
        move,
        last: boardGame,
      },
    });
  },
  onPlayerQuit: (plr, boardGame) => ({
    state: {
      message: `${plr} left!`,
      last: boardGame,
    },
  }),
};
