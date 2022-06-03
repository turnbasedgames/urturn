class UserNotInRoomError extends Error {
  constructor(user, room) {
    super(`${user.id}: ${user.username} is not in ${room.id}!`);
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
