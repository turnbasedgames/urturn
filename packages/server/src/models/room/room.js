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
  state: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
}, { timestamps: true });

RoomSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    game: this.game,
    leader: this.leader,
    state: this.state,
  };
});

module.exports = mongoose.model('Room', RoomSchema);
