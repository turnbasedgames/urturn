class RoomFinishedError extends Error {
  constructor(room) {
    super(`${room.id} is no longer mutable because it is finished!`);
    this.name = 'RoomFinished';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

module.exports = RoomFinishedError;
