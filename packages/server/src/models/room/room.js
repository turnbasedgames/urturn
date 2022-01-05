const mongoose = require('mongoose');

const { Schema } = mongoose;

const { addKVToObjectFactoryFn } = require('./util');

const MAX_NUM_USERS = 50;
const USER_EDITABLE_KEYS = new Set(['joinable']);
const RoomSchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Game',
    index: true,
  },
  latestState: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'RoomState',
  },
  users: {
    type: [{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    }],
    validate: [(users) => users.length <= MAX_NUM_USERS, `{PATH} exceeds the limit of ${MAX_NUM_USERS}`],
  },
  joinable: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
  },
}, { timestamps: true });

RoomSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    game: this.game,
    users: this.users,
    joinable: this.joinable,
    latestState: this.latestState,
  };
});
RoomSchema.method('applyCreatorData', addKVToObjectFactoryFn(USER_EDITABLE_KEYS));

module.exports = mongoose.model('Room', RoomSchema);
