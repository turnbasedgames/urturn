const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomSchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Game',
    index: true,
  },
  leader: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  latestState: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'RoomState',
  },
}, { timestamps: true });

RoomSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    game: this.game,
    leader: this.leader,
    latestState: this.latestState,
  };
});

module.exports = mongoose.model('Room', RoomSchema);
