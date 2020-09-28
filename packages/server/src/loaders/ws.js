const WebSocket = require('ws');

const handlers = require('src/handlers');
const Player = require('src/player.js');

function setup(server, logger) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    const plr = new Player(ws);
    logger.info(`player ${plr.id} joined`);

    ws.on('message', (msg) => {
      logger.info(`message received from player ${plr.id}:\n${msg}`);
      try {
        const parsed = JSON.parse(msg);
        handlers[parsed.type](plr, parsed, logger);
      } catch (e) {
        logger.error(e.toString());
        ws.send(JSON.stringify({
          receivedMsg: msg,
          e: e.toString(),
        }));
      }
    });

    ws.on('close', (code, reason) => {
      logger.info(`player ${plr.id} disconnected, code: ${code} reason: ${reason}`);
      // TODO: unsubscribe to redis pub/sub
      // TODO: emit room message that player has left room
    });
  });

  logger.info(`WSS setup with address ${JSON.stringify(wss.address(), null, 2)}`);
  return wss;
}

module.exports = setup;
