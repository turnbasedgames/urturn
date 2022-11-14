const CreatorError = require('./creatorError');
const RoomNotJoinableError = require('./roomNotJoinableError');
const RoomFinishedError = require('./roomFinishedError');
const UserNotInRoomError = require('./userNotInRoomError');
const UserAlreadyInRoomError = require('./userAlreadyInRoomError');

module.exports = {
  CreatorError, UserNotInRoomError, RoomFinishedError, RoomNotJoinableError, UserAlreadyInRoomError,
};
