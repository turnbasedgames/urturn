const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Room = require('./room');
const UserCode = require('./userCode');
const fetchUserCodeFromGame = require('./runner');

async function applyCreatorResult(prevRoomState, room, creatorRoomState, session) {
  const newRoomState = prevRoomState;
  // eslint-disable-next-line no-underscore-dangle
  newRoomState._id = mongoose.Types.ObjectId();
  newRoomState.isNew = true;
  newRoomState.version += 1;
  newRoomState.applyCreatorData(creatorRoomState);
  room.applyCreatorRoomState(creatorRoomState, newRoomState.id);
  room.markModified('latestState');
  await newRoomState.save({ session });
  await room.save({ session });
  return newRoomState;
}

async function populateRoomAndNotify(io, room, roomState) {
  await room.populate('players').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
  io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, roomState));
}

async function handlePostRoomOperation(res, io, room, roomState) {
  // publishing message is not part of the transaction because subscribers can
  // receive the message before mongodb updates the database
  await populateRoomAndNotify(io, room, roomState);
  res.status(StatusCodes.OK).json({ room });
}

async function quitRoomTransaction(logger, user, roomId) {
  const player = user.getCreatorDataView();
  let room;
  let roomState;
  await mongoose.connection.transaction(async (session) => {
    room = await Room.findById(roomId).populate('game').populate('players').populate('latestState')
      .session(session);
    room.playerQuit(user);
    const prevRoomState = room.latestState;
    const userCode = await fetchUserCodeFromGame(logger, room.game);
    const creatorQuitRoomState = userCode.playerQuit(player, room, prevRoomState);
    roomState = await applyCreatorResult(
      prevRoomState, room, creatorQuitRoomState, session,
    );
  });
  return { room, roomState };
}

module.exports = {
  applyCreatorResult,
  handlePostRoomOperation,
  quitRoomTransaction,
  populateRoomAndNotify,
};
