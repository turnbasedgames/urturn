const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const RoomUserSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Room',
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
}, { timestamps: true });

RoomUserSchema.index({ room: 1, user: 1 }, { unique: true });
RoomUserSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    room: this.room,
    user: this.user,
  };
});
RoomUserSchema.plugin(uniqueValidator);
RoomUserSchema.static('isUserInRoom', async function isUserInRoom(roomId, userId) {
  const count = await this.countDocuments({ room: roomId, user: userId });
  return count === 1;
});

module.exports = mongoose.model('RoomUser', RoomUserSchema);
