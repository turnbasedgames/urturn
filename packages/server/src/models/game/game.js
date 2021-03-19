/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

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
    match: new RegExp('^https://(www.)?github.com/.*.git$'),
    required: true,
  },
  commitSHA: {
    type: String,
    minLength: 1,
    required: true,
  },
}, { timestamps: true });

GameSchema.index({ name: 'text' });
GameSchema.plugin(uniqueValidator);
GameSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    creator: this.creator,
  };
});

module.exports = mongoose.model('Game', GameSchema);
