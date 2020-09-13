const WebSocket = require('ws');
const Player = require('./src/player');
const Game = require('./src/game');
const logger = require('./src/logger');

const wss = new WebSocket.Server({ port: 8080 });
const game = new Game();
const players = [];

wss.on('connection', (ws) => {
  const plr = new Player(ws);
  logger.info(`player ${plr.id} joined`);

  ws.on('message', (msg) => {
    logger.info(`message received from player ${plr.id}:\n${msg}`);
    let parsed;
    try {
      parsed = JSON.parse(msg);
    } catch (e) {
      logger.error(e);
      return;
    }
    switch (parsed.type) {
      case 'plr.move':
        game.makeMove(plr, parsed.move);
        break;
      default:
        logger.warn(`No type for \n${parsed}`);
    }
  });

  ws.on('close', (code, reason) => {
    logger.info(`player ${plr.id} disconnected, code: ${code} reason: ${reason}`);
  });

  players.push(plr);
  game.addPlayer(plr);

  if (game.isAbleToStart()) {
    game.startGame();
  }
});
