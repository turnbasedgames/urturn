const mongoose = require('mongoose');

const { Schema } = mongoose;

const { addKVToObjectFactoryFn, getKVToObjectFactoryFn } = require('./util');
const { UserNotInRoomError, RoomFinishedError, RoomNotJoinableError } = require('./errors');

const MAX_NUM_PLAYERS = 50;
const CREATOR_EDITABLE_KEYS = ['joinable', 'finished'];
const CREATOR_VIEWABLE_KEYS = [...CREATOR_EDITABLE_KEYS, 'players'];
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
  players: { // TODO: should we populate this providing it to users
    type: [{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    }],
    default: [],
    validate: [(players) => players.length <= MAX_NUM_PLAYERS, `{PATH} exceeds the limit of ${MAX_NUM_PLAYERS}`],
    index: true,
  },
  inactivePlayers: {
    type: [{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    }],
    default: [],
    validate: [function validateInactivePlayers(players) {
      const activePlayers = this.players;
      return players.every((player) => !activePlayers.includes(player));
    }, '{PATH} has players that are also active'],
    index: true,
  },
  joinable: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
  },
  finished: {
    type: Schema.Types.Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true });

RoomSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    game: this.game,
    players: this.players,
    inactivePlayers: this.inactivePlayers,
    joinable: this.joinable,
    finished: this.finished,
    latestState: this.latestState,
  };
});
RoomSchema.method('applyCreatorData', addKVToObjectFactoryFn(CREATOR_EDITABLE_KEYS));
RoomSchema.method('applyCreatorRoomState', function applyCreatorRoomState(creatorRoomState, newRoomStateId) {
  this.applyCreatorData(creatorRoomState);
  if (creatorRoomState.finished) {
    this.joinable = false;
    this.inactivePlayers = Array.from(new Set([...this.inactivePlayers, ...this.players]));
    this.players = [];
    this.markModified('joinable');
    this.markModified('players');
    this.markModified('inactivePlayers');
  }
  this.latestState = newRoomStateId;
  this.markModified('latestState');
});
RoomSchema.method('getCreatorDataView', getKVToObjectFactoryFn(CREATOR_VIEWABLE_KEYS));
RoomSchema.method('addPlayer', function removePlayer(playerId) {
  this.players.push(playerId);
  this.markModified('players');
});
RoomSchema.method('removePlayer', function removePlayer(playerId) {
  this.players = this.players.filter((player) => player.toString() !== playerId);
  this.markModified('players');
  this.inactivePlayers = Array.from(new Set([...this.inactivePlayers, playerId]));
  this.markModified('inactivePlayers');
});
RoomSchema.method('containsPlayer', function containsPlayer(playerId) {
  return this.players.includes(playerId);
});

RoomSchema.method('playerQuit', function playerQuit(playerId) {
  if (this.finished) {
    throw new RoomFinishedError(this);
  }
  if (!this.containsPlayer(playerId)) {
    throw new UserNotInRoomError(playerId, this);
  }
  this.removePlayer(playerId);
});

RoomSchema.method('playerJoin', function playerJoin(playerId) {
  if (this.finished) {
    throw new RoomFinishedError(this);
  }
  if (!this.joinable) {
    throw new RoomNotJoinableError(this);
  }
  this.addPlayer(playerId);
});

RoomSchema.method('playerMove', function playerMove(playerId) {
  if (this.finished) {
    throw new RoomFinishedError(this);
  }
  if (!this.containsPlayer(playerId)) {
    throw new UserNotInRoomError(playerId, this);
  }
});

module.exports = mongoose.model('Room', RoomSchema);
