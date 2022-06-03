const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const UserCode = require('./runner');

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

async function handlePostRoomOperation(res, io, room, roomState) {
  // publishing message is not part of the transaction because subscribers can
  // receive the message before mongodb updates the database
  await room.populate('players').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
  io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, roomState));
  res.status(StatusCodes.OK).json({ room });
}

module.exports = {
  applyCreatorResult,
  handlePostRoomOperation,
};
