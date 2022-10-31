const { CreatorError } = require('./errors');

class UserCode {
  constructor(logger, vmModule, sizeBytes) {
    this.vmModule = vmModule;
    this.logger = logger;
    this.sizeBytes = sizeBytes;
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
    const { vmModule, logger } = this;
    return UserCode.playerOperation(logger, null, null, 'onRoomStart', () => vmModule.onRoomStart({}));
  }

  playerJoin(player, room, roomState) {
    const { vmModule, logger } = this;
    return UserCode.playerOperation(logger, room, roomState, 'onPlayerJoin', (creatorRoomState) => vmModule.onPlayerJoin(
      player,
      creatorRoomState,
    ));
  }

  playerQuit(player, room, roomState) {
    const { vmModule, logger } = this;
    return UserCode.playerOperation(logger, room, roomState, 'onPlayerQuit', (creatorRoomState) => vmModule.onPlayerQuit(
      player,
      creatorRoomState,
    ));
  }

  playerMove(player, move, room, roomState) {
    const { vmModule, logger } = this;
    return UserCode.playerOperation(logger, room, roomState, 'onPlayerMove', (creatorRoomState) => vmModule.onPlayerMove(
      player,
      move,
      creatorRoomState,
    ));
  }
}

module.exports = UserCode;
