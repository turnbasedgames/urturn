const WebSocket = require('ws');
const logger = require('./src/logger');

const wss = new WebSocket.Server({ port: 8080 });
const clients = [];

wss.on('connection', (ws) => {
  logger.info('player joined');
  ws.on('message', (msg) => {
    logger.info(`message received from player:\n${msg}`);
  });

  ws.on('close', (code, reason) => {
    logger.info(`player disconnected, code: ${code} reason: ${reason}`);
  });

  clients.push(ws);
});
