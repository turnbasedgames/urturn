const { NodeVM } = require('vm2');
const axios = require('axios');

const logger = require('../../logger');
const { CreatorInvalidMoveError } = require('./errors');

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

  startRoom() {
    const newRoomState = this.userCodeRaw.onRoomStart({});
    logger.info('user code start room result', newRoomState);
    return newRoomState;
  }

  playerJoin(plrId, room, roomState) {
    const creatorRoomState = UserCode.getCreatorRoomState(room, roomState);
    logger.info('user code join player', creatorRoomState);
    const newRoomState = this.userCodeRaw.onPlayerJoin(
      plrId,
      creatorRoomState,
    );
    logger.info('user code join player result', newRoomState);
    return newRoomState;
  }

  playerQuit(plrId, room, roomState) {
    const creatorRoomState = UserCode.getCreatorRoomState(room, roomState);
    logger.info('user code player quit', creatorRoomState);
    const newRoomState = this.userCodeRaw.onPlayerQuit(
      plrId,
      creatorRoomState,
    );
    logger.info('user code player quit result', newRoomState);
    return newRoomState;
  }

  playerMove(plrId, move, room, roomState) {
    const creatorRoomState = UserCode.getCreatorRoomState(room, roomState);
    logger.info('user code player move', creatorRoomState);
    try {
      const newRoomState = this.userCodeRaw.onPlayerMove(
        plrId,
        move,
        creatorRoomState,
      );
      logger.info('user code player move result', newRoomState);
      return newRoomState;
    } catch (error) {
      if (error.name) {
        throw new CreatorInvalidMoveError(error.name, error.message);
      }
      throw error;
    }
  }
}

module.exports = UserCode;
