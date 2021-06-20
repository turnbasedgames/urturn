/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const admin = require('firebase-admin');

const GAME_TEMPLATE_PREFIX = 'templates/tictactoe/';
const bucket = admin.storage().bucket();

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
    match: new RegExp('^https://(www.)?github.com/.*/.*$'),
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
GameSchema.method('addGameTemplateFiles', async function addGameTemplateFiles() {
  const userId = this.populated('creator') ? this.creator.id : this.creator;
  const [templateFiles] = await bucket.getFiles({ prefix: GAME_TEMPLATE_PREFIX });
  return Promise.all(templateFiles.map((file) => {
    const newFilePrefix = `users/${userId}/games/${this.id}/code/`;
    const newFileName = newFilePrefix + file.name.substring(GAME_TEMPLATE_PREFIX.length);
    return file.copy(bucket.file(newFileName));
  }));
});
GameSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    creator: this.creator,
    githubURL: this.githubURL,
    commitSHA: this.commitSHA,
  };
});

module.exports = mongoose.model('Game', GameSchema);
