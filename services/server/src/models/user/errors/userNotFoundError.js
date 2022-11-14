class UserNotFoundError extends Error {
  constructor() {
    super('Failed to find user');
    this.name = 'UserNotFound';
  }

  toJSON() {
    return {
      name: this.name,
    };
  }
}

module.exports = UserNotFoundError;
