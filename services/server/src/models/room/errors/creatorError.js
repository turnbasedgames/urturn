class CreatorError extends Error {
  constructor(name, message) {
    super('Creator code threw an error');
    this.name = 'CreatorError';
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

module.exports = CreatorError;
