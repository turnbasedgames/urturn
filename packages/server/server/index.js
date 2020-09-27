const WebSocket = require('ws');
const Player = require('./src/player');
const Game = require('./src/game');
const logger = require('./src/logger');
const handlers = require('./src/handlers');

const wss = new WebSocket.Server({ port: 8080 });
const game = new Game();
const players = [];

wss.on('connection', (ws) => {
  const plr = new Player(ws);
  logger.info(`player ${plr.id} joined`);

  ws.on('message', (msg) => {
    logger.info(`message received from player ${plr.id}:\n${msg}`);
    try {
      const parsed = JSON.parse(msg);
      handlers[parsed.type](plr, parsed);
    } catch (e) {
      logger.error(e);
      // TODO: Notify client
    }
  });

  ws.on('close', (code, reason) => {
    logger.info(`player ${plr.id} disconnected, code: ${code} reason: ${reason}`);
    // TODO: unsubscribe to redis pub/sub
    // TODO: emit room message that player has left room
  });

  players.push(plr);
  game.addPlayer(plr);

  if (game.isAbleToStart()) {
    game.startGame();
  }
});
