const WebSocket = require('ws');
const readline = require('readline');
const logger = require('../src/logger');

const WS_PATH = 'ws://localhost:8080';
const ws = new WebSocket(WS_PATH);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt('send> ');
rl.on('line', (line) => {
  if (line === 'exit') {
    rl.close();
  } else {
    ws.send(line);
    rl.prompt();
  }
}).on('close', () => {
  logger.info('bye');
  process.exit(0);
});

ws.on('open', () => {
  logger.info(`Connection opened with at ${WS_PATH}`);
  rl.prompt();
});

ws.on('message', (data) => {
  logger.info(`Incoming data:\n${data}`);
});
