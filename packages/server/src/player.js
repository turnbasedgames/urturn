const { v4: uuidv4 } = require('uuid');

class Player {
  constructor(ws) {
    this.ws = ws;
    this.id = uuidv4();
  }

  toJSON() {
    return {
      id: this.id,
    };
  }
}

module.exports = Player;
