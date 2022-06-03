const { NodeVM } = require('vm2');
const axios = require('axios');

const { CreatorError } = require('./errors');

class UserCode {
  constructor(logger, userCodeRaw) {
    this.userCodeRaw = userCodeRaw;
    this.logger = logger;
  }

  static async fromGame(logger, game) {
    logger.info('getting game code', { url: game.githubURL, id: game.id });
    const githubURL = new URL(game.githubURL);
    const [owner, repo] = githubURL.pathname.match(/[^/]+/g);
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${game.commitSHA}/index.js`;
    const { data: userCodeRawStr } = await axios.get(url);
    const vm = new NodeVM({});
    // TODO: actually put the creator logs somewhere useful so that developers can debug
    vm.on('console.log', (data) => {
      logger.info('creator log', { data, gameId: game.id });
    });
    const userCodeRaw = vm.run(userCodeRawStr);
    const userCode = new UserCode(logger, userCodeRaw);

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

  static playerOperation(logger, room, roomState, operation, operationFunc) {
    logger.info('running room operation', { operation });
    let creatorRoomState = {};
    if (room && roomState) {
      creatorRoomState = UserCode.getCreatorRoomState(room, roomState);
      logger.info('state before operation', { creatorRoomState });
    }
    try {
      const newRoomState = operationFunc(creatorRoomState);
      logger.info('state after operation', { newRoomState });
      return newRoomState;
    } catch (error) {
      if (error.name) {
        throw new CreatorError(error.name, error.message);
      }
      throw error;
    }
  }

  startRoom() {
    const { userCodeRaw, logger } = this;
    return UserCode.playerOperation(logger, null, null, 'onRoomStart', () => userCodeRaw.onRoomStart({}));
  }

  playerJoin(player, room, roomState) {
    const { userCodeRaw, logger } = this;
    return UserCode.playerOperation(logger, room, roomState, 'onPlayerJoin', (creatorRoomState) => userCodeRaw.onPlayerJoin(
      player,
      creatorRoomState,
    ));
  }

  playerQuit(player, room, roomState) {
    const { userCodeRaw, logger } = this;
    return UserCode.playerOperation(logger, room, roomState, 'onPlayerQuit', (creatorRoomState) => userCodeRaw.onPlayerQuit(
      player,
      creatorRoomState,
    ));
  }

  playerMove(player, move, room, roomState) {
    const { userCodeRaw, logger } = this;
    return UserCode.playerOperation(logger, room, roomState, 'onPlayerMove', (creatorRoomState) => userCodeRaw.onPlayerMove(
      player,
      move,
      creatorRoomState,
    ));
  }
}

module.exports = UserCode;
