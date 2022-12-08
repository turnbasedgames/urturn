class RoomNotPrivateError extends Error {
  constructor(room) {
    super(`Room ${room.id} is not private!`);
    this.name = 'RoomNotPrivate';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

module.exports = RoomNotPrivateError;
