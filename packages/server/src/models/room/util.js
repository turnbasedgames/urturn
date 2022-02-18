const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const UserCode = require('./runner');

function addKVToObjectFactoryFn(filteredKeys) {
  return function addKVToObjectFn(obj) {
    const curObj = this;
    filteredKeys.forEach((key) => {
      if (key in obj) {
        curObj[key] = obj[key];
      }
    });
  };
}

function getKVToObjectFactoryFn(filteredKeys) {
  return function getKVT() {
    return filteredKeys.reduce((curObj, key) => {
      if (key in this) {
        return { ...curObj, [key]: this[key] };
      }
      return curObj;
    }, {});
  };
}

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
  io.to(room.id).emit('room:latestState', UserCode.getCreatorRoomState(room, roomState));
  await room.populate('players').populate('latestState').populate({ path: 'game', populate: { path: 'creator' } }).execPopulate();
  res.status(StatusCodes.OK).json({ room });
}

module.exports = {
  applyCreatorResult,
  handlePostRoomOperation,
  addKVToObjectFactoryFn,
  getKVToObjectFactoryFn,
};
