const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomStateSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Room',
    index: true,
  },
  state: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  version: {
    type: Schema.Types.Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

RoomStateSchema.index({ room: 1, version: 1 }, { unique: true });
RoomStateSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    room: this.room,
    state: this.state,
    version: this.version,
  };
});

module.exports = mongoose.model('RoomState', RoomStateSchema);
