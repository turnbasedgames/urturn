const { NodeVM } = require('vm2');
const axios = require('axios');

const logger = require('../../logger');

class UserCode {
  constructor(userCodeRaw) {
    this.userCodeRaw = userCodeRaw;
  }

  startRoom() {
    const newState = this.userCodeRaw.onRoomStart({}, null);
    logger.info('usercode start room result', { state: newState });
    return newState;
  }

  joinPlayer(plrId, curState) {
    logger.info('usercode join player', { state: curState });
    const newState = this.userCodeRaw.onPlayerJoin({}, plrId, curState);
    logger.info('usercode join player result', { state: newState });
    return newState;
  }

  playerMove(plrId, move, curState) {
    logger.info('usercode player move', { state: curState });
    const newState = this.userCodeRaw.onPlayerMove({}, plrId, move, curState);
    logger.info('usercode player move result', { state: newState });
    return newState;
  }
}

async function getUserCode(game) {
  logger.info('getting game code', { url: game.githubURL, id: game.id });
  const githubURL = new URL(game.githubURL);
  const [owner, repo] = githubURL.pathname.match(/[^/]+/g);
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${game.commitSHA}/index.js`;
  const { data: userCodeRawStr } = await axios.get(url);

  const vm = new NodeVM({});
  vm.on('console.log', (data) => {
    logger.info('usercode:', { data });
  });
  const userCodeRaw = vm.run(userCodeRawStr);
  const userCode = new UserCode(userCodeRaw);
  return userCode;
}

module.exports = { getUserCode };
