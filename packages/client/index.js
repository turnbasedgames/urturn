const { connectToParent } = require('penpal');

const EventEmitter = require('./src/util/eventEmitter');

const eventEmitter = new EventEmitter();

let curBoardGame = null;
const setBoardGameWithContender = (contender) => {
  if (!curBoardGame || (curBoardGame.version < contender.version)) {
    curBoardGame = contender;
    eventEmitter.emit('stateChanged', contender);
  }
};

const connection = connectToParent({
  methods: {
    stateChanged(boardGame) {
      setBoardGameWithContender(boardGame);
    },
  },
});

function getBoardGame() {
  return curBoardGame;
}

async function getLocalPlayer() {
  const parent = await connection.promise;
  return parent.getLocalPlayer();
}

async function makeMove(move) {
  const parent = await connection.promise;
  return parent.makeMove(move);
}

module.exports = {
  getBoardGame, getLocalPlayer, makeMove, events: eventEmitter,
};
