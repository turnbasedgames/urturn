class UserAlreadyInRoomError extends Error {
  constructor(user, room) {
    super(`${user.id}: ${user.username} is already in room ${room.id}!`);
    this.name = 'UserAlreadyInRoom';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

module.exports = UserAlreadyInRoomError;
