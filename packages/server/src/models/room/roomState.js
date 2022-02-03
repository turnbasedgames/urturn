const mongoose = require('mongoose');

const { Schema } = mongoose;

const { addKVToObjectFactoryFn, getKVToObjectFactoryFn } = require('./util');

const CREATOR_EDITABLE_KEYS = ['state'];
const CREATOR_VIEWABLE_KEYS = [...CREATOR_EDITABLE_KEYS, 'version'];
const RoomStateSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Room',
    index: true,
  },
  version: {
    type: Schema.Types.Number,
    required: true,
    default: 0,
  },
  state: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
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
RoomStateSchema.method('applyCreatorData', addKVToObjectFactoryFn(CREATOR_EDITABLE_KEYS));
RoomStateSchema.method('getCreatorDataView', getKVToObjectFactoryFn(CREATOR_VIEWABLE_KEYS));

module.exports = mongoose.model('RoomState', RoomStateSchema);
