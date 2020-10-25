const readline = require('readline');
const logger = require('../src/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function setup(ws) {
  rl.setPrompt('send> ');
  rl.on('line', (line) => {
    if (line === 'exit') {
      rl.close();
    } else {
      ws.send(line);
      rl.prompt();
    }
  }).on('close', () => {
    ws.close();
    logger.info('bye');
    process.exit(0);
  });
}

function get() {
  return rl;
}

module.exports = { setupRL: setup, getRL: get };
