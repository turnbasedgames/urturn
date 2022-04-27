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
  onPlayerMove: (plr, move, boardGame) => CREATOR_EDITABLE_FIELDS.reduce((prev, field) => {
    if (move[field]) {
      return { ...prev, [field]: move[field] };
    }
    return prev;
  }, {
    state: {
      message: `${plr} made move!`,
      move,
      last: boardGame,
    },
  }),
  onPlayerQuit: (plr, boardGame) => ({
    state: {
      message: `${plr} left!`,
      last: boardGame,
    },
  }),
};
