const WebSocket = require('ws');
const logger = require('../src/logger');

const WS_PATH = 'ws://localhost:8080';
const ws = new WebSocket(WS_PATH);

ws.on('open', () => {
  logger.info(`Connection opened with at ${WS_PATH}`);
});

ws.on('message', (data) => {
  logger.info(`Incoming data:\n${data}`);
});
