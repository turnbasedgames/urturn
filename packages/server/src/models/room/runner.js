const { NodeVM } = require('vm2');
const axios = require('axios');

const logger = require('../../logger');
const { CreatorError } = require('./errors');

class UserCode {
  constructor(userCodeRaw) {
    this.userCodeRaw = userCodeRaw;
  }

  static async fromGame(game) {
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

  static getCreatorRoomState(room, roomState) {
    // there is some type data loss (https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript),
    // but converts types into standardized JSON for creator code
    return JSON.parse(JSON.stringify({
      ...room.getCreatorDataView(),
      ...roomState.getCreatorDataView(),
    }));
  }

  static playerOperation(room, roomState, operation, operationFunc) {
    logger.info(`Operation: ${operation}`);
    let creatorRoomState = {};
    if (room && roomState) {
      creatorRoomState = UserCode.getCreatorRoomState(room, roomState);
      logger.info('current creatorRoomState', creatorRoomState);
    }
    try {
      const newRoomState = operationFunc(creatorRoomState);
      logger.info('result creatorRoomState', newRoomState);
      return newRoomState;
    } catch (error) {
      if (error.name) {
        throw new CreatorError(error.name, error.message);
      }
      throw error;
    }
  }

  startRoom() {
    const { userCodeRaw } = this;
    return UserCode.playerOperation(null, null, 'onRoomStart', () => userCodeRaw.onRoomStart({}));
  }

  playerJoin(plrId, room, roomState) {
    const { userCodeRaw } = this;
    return UserCode.playerOperation(room, roomState, 'onPlayerJoin', (creatorRoomState) => userCodeRaw.onPlayerJoin(
      plrId,
      creatorRoomState,
    ));
  }

  playerQuit(plrId, room, roomState) {
    const { userCodeRaw } = this;
    return UserCode.playerOperation(room, roomState, 'onPlayerQuit', (creatorRoomState) => userCodeRaw.onPlayerQuit(
      plrId,
      creatorRoomState,
    ));
  }

  playerMove(plrId, move, room, roomState) {
    const { userCodeRaw } = this;
    return UserCode.playerOperation(room, roomState, 'onPlayerMove', (creatorRoomState) => userCodeRaw.onPlayerMove(
      plrId,
      move,
      creatorRoomState,
    ));
  }
}

module.exports = UserCode;
