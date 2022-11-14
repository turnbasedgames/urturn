class UsernameGenerationError extends Error {
  constructor(firebaseUid, proposedUsernames) {
    super(`Failed to generate a unique username uid ${firebaseUid}`);
    this.name = 'UsernameGeneration';
    this.proposedUsernames = proposedUsernames;
  }

  toJSON() {
    return {
      name: this.name,
      proposedUsernames: this.proposedUsernames,
    };
  }
}

module.exports = UsernameGenerationError;
