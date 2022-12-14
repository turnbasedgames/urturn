const { connectToParent } = require('penpal');

const EventEmitter = require('./src/util/eventEmitter');

const OFFSET_HISTORY_LENGTH = 10;

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

let parentSync = null;
const connection = connectToParent({
  methods: {
    stateChanged(roomState) {
      setRoomStateWithContender(roomState);
    },
  },
});
console.log('ab');
connection.promise.then((v) => {
  console.log('CONNECTION.PROMISE CALLED');
  parentSync = v;
}).catch((e) => console.error(e));

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

const offsets = new Array(OFFSET_HISTORY_LENGTH);
const latencies = new Array(OFFSET_HISTORY_LENGTH);
let idx = 0;
let serverTime = Date.now();
setInterval(async () => {
  console.log('SET INTERVAL ');
  try {
    const parent = await connection.promise;
    console.log('PARENT: ', parent);
    const requestTimeMS = new Date().getTime();
    const serverTimeMS = await parent.getServerTime();
    const responseTimeMS = new Date().getTime();

    const latency = (responseTimeMS - requestTimeMS) / 2;
    latencies[idx] = latency;
    offsets[idx] = serverTimeMS - average(latencies.filter((n) => n != null)) - requestTimeMS;

    idx = (idx + 1) % OFFSET_HISTORY_LENGTH;

    serverTime = average(offsets.filter((n) => n != null));
  } catch (e) {
    console.log('ERROR: ', e);
  }
}, 500);

function now() {
  console.log(offsets);
  return serverTime;
}

module.exports = {
  getRoomState, getBoardGame, getLocalPlayer, makeMove, now, events: eventEmitter,
};
