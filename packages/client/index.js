const { connectToParent } = require('penpal');

const EventEmitter = require('./src/util/eventEmitter');

const eventEmitter = new EventEmitter();

let curRoomState = null;
const setRoomStateWithContender = (contender) => {
  if (!curRoomState || (curRoomState.version < contender.version)) {
    curRoomState = contender;
    eventEmitter.emit('stateChanged', contender);
  }
};

let parentSync = null;
const connection = connectToParent({
  methods: {
    stateChanged(roomState) {
      setRoomStateWithContender(roomState);
    },
  },
}).then((v) => { parentSync = v; });

function getBoardGame() {
  console.warn('client.getBoardGame() is deprecated. Use client.getRoomState() instead.');
  return curRoomState;
}

function getRoomState() {
  return curRoomState;
}

async function getLocalPlayer() {
  const parent = await connection.promise;
  return parent.getLocalPlayer();
}

async function makeMove(move) {
  const parent = await connection.promise;
  return parent.makeMove(move);
}

function now() {
  if (parentSync != null) {
    return parentSync.now();
  }
  return Date.now();
}

module.exports = {
  getRoomState, getBoardGame, getLocalPlayer, makeMove, now, events: eventEmitter,
};
