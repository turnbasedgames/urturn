const CREATOR_EDITABLE_FIELDS = ['joinable', 'finished', 'state'];
const CREATOR_VIEWABLE_FIELDS = [...CREATOR_EDITABLE_FIELDS, 'version', 'players'];

const FIELD_TYPES = {
  joinable: (x) => typeof x === 'boolean',
  finished: (x) => typeof x === 'boolean',
  state: (x) => typeof x === 'object',
  version: (x) => typeof x === 'number',
  players: (x) => Array.isArray(x)
   && x.every(
     (player) => typeof player.id === 'string'
      && typeof player.username === 'string',
   ),
};

function filterBoardGame(state) {
  return CREATOR_VIEWABLE_FIELDS.reduce(
    (newState, key) => ({
      ...newState,
      [key]: state[key],
    }),
    {},
  );
}

function validateBoardGame(state) {
  const filteredState = filterBoardGame(state);

  Object.keys(state).forEach((key) => {
    if (!CREATOR_VIEWABLE_FIELDS.includes(key)) throw Error(`Invalid key: ${key} - maybe move into the 'state' field?`);
  });

  Object.keys(filteredState).forEach((key) => {
    if (state[key] === undefined) throw Error(`Missing key: ${key}`);
  });

  Object.keys(filteredState).forEach((key) => {
    // eslint-disable-next-line valid-typeof
    if (!(FIELD_TYPES[key](filteredState[key]))) {
      throw Error(`Typeof ${key} is incorrect.`);
    }
  });
}

function applyBoardGameResult(state, result) {
  return Object.keys(result).reduce((newState, key) => {
    if (CREATOR_EDITABLE_FIELDS.includes(key)) {
      return { ...newState, [key]: result[key] };
    }
    throw new Error(`key "${key}" is not editable`);
  }, { ...state, version: state.version + 1 });
}

function newBoardGame(backendModule) {
  const boardGame = {
    joinable: true,
    finished: false,
    players: [],
    version: -1,
    // Used to generate unique user ids with a simple counter. No new user will have the same id
    playerIdCounter: 0,
  };
  return applyBoardGameResult(boardGame, backendModule.onRoomStart());
}

function getPlayerById(id, boardGame) {
  return boardGame.players.find((plr) => plr.id === id);
}

function removePlayerById(id, boardGame) {
  return { ...boardGame, players: boardGame.players.filter((p) => p.id !== id) };
}

module.exports = {
  CREATOR_EDITABLE_FIELDS,
  CREATOR_VIEWABLE_FIELDS,
  newBoardGame,
  applyBoardGameResult,
  filterBoardGame,
  getPlayerById,
  removePlayerById,
  validateBoardGame,
};
