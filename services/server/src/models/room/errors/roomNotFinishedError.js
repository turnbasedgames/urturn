class RoomNotFinishedError extends Error {
  constructor(room) {
    super(`Room ${room.id} is not finished!`);
    this.name = 'RoomNotFinished';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

module.exports = RoomNotFinishedError;
