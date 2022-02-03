class CreatorInvalidMoveError extends Error {
  constructor(name, message) {
    super('Creator code threw an InvalidMove error');
    this.name = 'CreatorInvalidMove';
    this.creatorError = {
      name, message,
    };
  }

  toJSON() {
    return {
      name: this.name,
      creatorError: this.creatorError,
    };
  }
}

module.exports = CreatorInvalidMoveError;
