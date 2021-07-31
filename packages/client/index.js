const {connectToParent} = require('penpal')

const EventEmitter = require('./src/util/eventEmitter')

const eventEmitter = new EventEmitter();

const connection = connectToParent({
  methods: {
    stateChanged(state) {
      eventEmitter.emit("stateChanged", state)
    },
  },
});

async function getStates(){
  const parent = await connection.promise
  return parent.getStates()
}

async function getLatestState(){
  const parent = await connection.promise
  return parent.getLatestState()
}

async function makeMove(move){
  const parent = await connection.promise
  return parent.makeMove(move)
}

module.exports = {getStates, getLatestState, makeMove, on: eventEmitter.on, off: eventEmitter.off}
