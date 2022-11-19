const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const { Schema } = mongoose;

const CREATOR_EDITABLE_KEYS = ['name', 'description', 'githubURL', 'commitSHA', 'customURL'];
const GameSchema = new Schema({
  name: {
    type: String,
    max: 128,
    default: 'playground',
    required: true,
  },
  description: {
    type: String,
    max: 1048,
    default: '',
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  githubURL: {
    type: String,
    match: new RegExp('^https://(www.)?github.com/.*/.*$'),
    required: true,
  },
  commitSHA: {
    type: String,
    minLength: 1,
    required: true,
  },
  activePlayerCount: {
    type: Number,
    required: true,
    default: 0,
    index: true,
    validate: {
      validator: (activePlayerCount) => Number
        .isInteger(activePlayerCount) && activePlayerCount >= 0,
      message: '{VALUE} is not a non-negative integer value',
    },
  },
  customURL: {
    type: String,
    unique: true,
    validate: {
      validator: (customURL) => /^[-0-9a-zA-Z]+$/.test(customURL) && customURL[customURL.length - 1] !== '-',
    },
  },
}, { timestamps: true });

GameSchema.index({ name: 'text', description: 'text' });
// Sort order is descending for activePlayerCount because queries will search for most active games
// to less active games.
GameSchema.index({ activePlayerCount: -1 });

GameSchema.method('updateByUser', async function updateByUser(changes) {
  const changeKeys = Object.keys(changes);
  const forbiddenKeys = changeKeys.filter((key) => !CREATOR_EDITABLE_KEYS.includes(key));
  if (forbiddenKeys.length > 0) {
    const error = new Error(`Cannot modify keys: ${forbiddenKeys.join(', ')}`);
    error.status = StatusCodes.FORBIDDEN;
    throw error;
  }

  changeKeys.forEach((key) => {
    this[key] = changes[key];
  });

  await this.save();
});
GameSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    activePlayerCount: this.activePlayerCount,
    name: this.name,
    description: this.description,
    creator: this.creator,
    githubURL: this.githubURL,
    commitSHA: this.commitSHA,
  };
});

module.exports = mongoose.model('Game', GameSchema);
