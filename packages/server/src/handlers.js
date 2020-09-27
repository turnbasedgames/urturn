module.exports = {
  joinGame: (plr, msg, logger) => {
    logger.info(plr, msg);
    // TODO: general validation on input
    // TODO: validate client can join the game
    // TODO: subscribe to redis pub/sub
    // TODO: emit room message that player has joined room
  },
  msgRoom: (plr, msg, logger) => {
    logger.info(plr, msg);
    /**
     * TODO: Dev code evaluated here
     * - validate move
     * - update game state
     * arguments (plr, currentGameState, msg)
     * returns [newGameState, msgToBeEmitted]
     * throws [InvalidMove, unauthorized player]
     */
    // TODO: validate move
    // TODO: update game state to mongodb
    // TODO: emit room message that player has made a move
  },
};
