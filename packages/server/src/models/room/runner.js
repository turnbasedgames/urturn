const { NodeVM } = require('vm2');
const axios = require('axios');

const logger = require('../../logger');

class UserCode {
  constructor(userCodeRaw) {
    this.userCodeRaw = userCodeRaw;
  }

  startRoom() {
    const newRoomState = this.userCodeRaw.onRoomStart({});
    logger.info('user code start room result', newRoomState);
    return newRoomState;
  }

  // TODO: roomState doesn't include joinable value or other keys in Room
  //       we should apply those previous values to the roomState
  joinPlayer(plrId, roomState) {
    const roomStateJSON = roomState.toJSON();
    logger.info('user code join player', roomStateJSON);
    const newRoomState = this.userCodeRaw.onPlayerJoin({}, plrId, roomStateJSON);
    logger.info('user code join player result', newRoomState);
    return newRoomState;
  }

  playerMove(plrId, move, roomState) {
    const roomStateJSON = roomState.toJSON();
    logger.info('user code player move', roomStateJSON);
    const newRoomState = this.userCodeRaw.onPlayerMove({}, plrId, move, roomStateJSON);
    logger.info('user code player move result', newRoomState);
    return newRoomState;
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
    logger.info('user code:', { data });
  });
  const userCodeRaw = vm.run(userCodeRawStr);
  const userCode = new UserCode(userCodeRaw);
  return userCode;
}

module.exports = { getUserCode };
