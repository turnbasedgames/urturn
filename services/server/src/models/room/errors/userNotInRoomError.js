class UserNotInRoomError extends Error {
  constructor(user) {
    super(`You (${user.username}) are not in the room! You are spectating.`);
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
