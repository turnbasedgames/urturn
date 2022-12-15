const { connectToParent } = require('penpal');

const EventEmitter = require('./src/util/eventEmitter');

const OFFSET_HISTORY_LENGTH = 10;
const OFFSET_INTERVAL_MS = 500;

const eventEmitter = new EventEmitter();

function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

let curRoomState = null;
const setRoomStateWithContender = (contender) => {
  if (!curRoomState || (curRoomState.version < contender.version)) {
    curRoomState = contender;
    eventEmitter.emit('stateChanged', contender);
  }
};

const connection = connectToParent({
  methods: {
    stateChanged(roomState) {
      setRoomStateWithContender(roomState);
    },
  },
});

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

// Keep track of the last OFFSET_HISTORY_LENGTH offsets calculated using Cristian's algorithm
// https://en.wikipedia.org/wiki/Cristian%27s_algorithm
// The offsets array acts as a bounded buffer with size OFFSET_HISTORY_LENGTH. We overwrite old
// values incrementally to maintain the last OFFSET_HISTORY_LENGTH calculated offsets.
const offsets = new Array(OFFSET_HISTORY_LENGTH);
let offsetIdx = 0;
setInterval(async () => {
  try {
    const parent = await connection.promise;
    offsets[offsetIdx] = await parent.getServerTimeOffsetMS();
    offsetIdx = (offsetIdx + 1) % OFFSET_HISTORY_LENGTH;
  } catch (e) {
    console.warn('error in getting server clock offset', e);
  }
}, OFFSET_INTERVAL_MS);

// Takes the average of all the offsets calculated and adds to current date.
// Smoothing out the last offsets will help avoid potential jitter.
function now() {
  const smoothOffset = average(offsets.filter((n) => n != null));
  return Date.now() + smoothOffset;
}

module.exports = {
  getRoomState, getBoardGame, getLocalPlayer, makeMove, now, events: eventEmitter,
};
