const WebSocket = require('ws');
const logger = require('../src/logger');
const { setupRL, getRL } = require('./cli');

const WS_PATH = 'ws://localhost:8080';
const ws = new WebSocket(WS_PATH);

ws.on('open', () => {
  logger.info(`Connection opened with at ${WS_PATH}`);
  getRL().prompt();
});

ws.on('message', (data) => {
  logger.info(`Incoming data:\n${data}`);
  const parsed = JSON.parse(data);
  switch (parsed.type) {
    case 'plr.move':
      logger.info(`player ${parsed.plr.id} made move ${parsed.move}`);
      break;
    case 'plr.join':
      logger.info(`player ${parsed.plr.id} joined`);
      break;
    case 'plr.disconnect':
      logger.info(`player ${parsed.plr.id} disconnected`);
      break;
    case 'game.end':
      logger.info(`game ended, ${parsed.winner.id} won!`);
      break;
    case 'game.start':
      logger.info(`game start, initial state ${parsed.initialState}`);
      break;
    default:
      logger.warn(`No type for\n${parsed}`);
  }
});

setupRL(ws);
