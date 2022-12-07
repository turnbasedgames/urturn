const CreatorError = require('./creatorError');
const RoomNotJoinableError = require('./roomNotJoinableError');
const RoomFinishedError = require('./roomFinishedError');
const RoomNotFinishedError = require('./roomNotFinishedError');
const UserNotInRoomError = require('./userNotInRoomError');
const UserAlreadyInRoomError = require('./userAlreadyInRoomError');

module.exports = {
  CreatorError,
  UserNotInRoomError,
  RoomFinishedError,
  RoomNotFinishedError,
  RoomNotJoinableError,
  UserAlreadyInRoomError,
};
