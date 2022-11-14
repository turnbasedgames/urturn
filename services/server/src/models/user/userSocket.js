const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSocketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    // TODO: when a user gets deleted, we'll want to delete all of these sockets
    index: true,
  },
  game: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Game',
    // TODO: when a game gets deleted, we'll want to delete all of these sockets
    index: true,
  },
  room: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Room',
    // querying for all the active sockets on a room
    index: true,
  },
  socketId: {
    type: Schema.Types.String,
    required: true,
    // A socket can only be connected to one room in its lifetime
    unique: true,
    index: true,
  },
},
// Timestamps in case we want a separate daemon to expire sockets. Socket server would also
// need to handle the case where the socket is deleted while still connected.
{ timestamps: true });

// A user may be connected to the same room via many different sockets (e.g. different tabs).
// Need a way to query the collection to see if user is actively connected to a room in any socket.
// This query will be called every time the user disconnects a socket so it should be indexed.
UserSocketSchema.index({ room: 1, user: 1 });

// A user may be connected to the same game via many different sockets (e.g. different rooms,
// tabs, devices).
// Need a way to query the collection to see if user is actively connected to a game in any socket.
// This query will be called every time the user connects or disconnects a socket in order to
// maintain the activePlayerCount for a game so it should be indexed.
UserSocketSchema.index({ user: 1, game: 1 });

module.exports = mongoose.model('UserSocket', UserSocketSchema);
