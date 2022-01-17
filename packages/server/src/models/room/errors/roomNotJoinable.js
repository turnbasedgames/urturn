class RoomNotJoinable extends Error {
  constructor(room) {
    super(`${room.id} is not joinable!`);
    this.name = 'RoomNotJoinable';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

module.exports = RoomNotJoinable;
