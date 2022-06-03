const mongoose = require('mongoose');

const { Schema } = mongoose;

const { addKVToObjectFactoryFn, getKVToObjectFactoryFn } = require('../util');
const {
  UserNotInRoomError, UserAlreadyInRoomError, RoomFinishedError, RoomNotJoinableError,
} = require('./errors');

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
  players: {
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
  // Prevents user data from being leaked. Only public viewable data is provided
  // (e.g. username, id). See UserSchema for implementation.
  let { players, inactivePlayers } = this;
  if (this.populated('players')) {
    players = players.map((plr) => plr.getCreatorDataView());
  }
  if (this.populated('inactivePlayers')) {
    inactivePlayers = inactivePlayers.map((plr) => plr.getCreatorDataView());
  }

  return {
    id: this.id,
    game: this.game,
    players,
    inactivePlayers,
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
RoomSchema.method('getCreatorDataView', getKVToObjectFactoryFn(CREATOR_VIEWABLE_KEYS, {
  // prevents exposure of other player private data when viewing the room data
  players: (players) => players.map((plr) => plr.getCreatorDataView()),
}));
RoomSchema.method('removePlayer', function removePlayer(playerToRemove) {
  // this.players may or may not be populated. We need to handle both cases.
  if (this.populated('players') === undefined) {
    this.players = this.players.filter((player) => !player.equals(playerToRemove.id));
  } else {
    this.players = this.players.filter((player) => player.id !== playerToRemove.id);
  }
  this.markModified('players');
  this.inactivePlayers = Array.from(new Set([...this.inactivePlayers, playerToRemove.id]));
  this.markModified('inactivePlayers');
});

RoomSchema.method('containsPlayer', function containsPlayer(player) {
  // this.players may or may not be populated. We need to handle both cases.
  if (this.populated('players') === undefined) {
    return this.players.some((somePlrId) => somePlrId.equals(player.id));
  }
  return this.players.some(
    (somePlr) => somePlr // player can be null reference if deleted
     // don't use .equals operator because .id is a string not an ObjectId
     // https://stackoverflow.com/questions/15724272/what-is-the-difference-between-id-and-id-in-mongoose
     && somePlr.id === player.id,
  );
});

RoomSchema.method('playerQuit', function playerQuit(player) {
  if (this.finished) {
    throw new RoomFinishedError(this);
  }
  if (!this.containsPlayer(player)) {
    throw new UserNotInRoomError(player, this);
  }
  this.removePlayer(player);
});

RoomSchema.method('playerJoin', function playerJoin(player) {
  if (this.finished) {
    throw new RoomFinishedError(this);
  }
  if (!this.joinable) {
    throw new RoomNotJoinableError(this);
  }
  if (this.containsPlayer(player)) {
    throw new UserAlreadyInRoomError(player, this);
  }
  this.players.push(player);
  this.markModified('players');
});

RoomSchema.method('playerMove', function playerMove(player) {
  if (this.finished) {
    throw new RoomFinishedError(this);
  }
  if (!this.containsPlayer(player)) {
    throw new UserNotInRoomError(player, this);
  }
});

module.exports = mongoose.model('Room', RoomSchema);
