class UserNotInRoomError extends Error {
  constructor(userId, room) {
    super(`${userId} is not in ${room.id}!`);
    this.name = 'UserNotInRoom';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

module.exports = UserNotInRoomError;
