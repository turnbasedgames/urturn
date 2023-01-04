const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const { Octokit } = require('octokit');

const octokit = new Octokit();

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
    match: [new RegExp('^https://(www.)?github.com/.+/.+$'), 'Invalid GitHub URL format'],
    required: true,
    validate: {
      validator: async function validateGitHubURL(rawGitHubURL) {
        const githubURL = new URL(rawGitHubURL);
        const [owner, repo] = githubURL.pathname.match(/[^/]+/g);
        await octokit.rest.repos.get({
          owner,
          repo,
        }).catch((error) => {
          if (error.status === StatusCodes.NOT_FOUND) {
            throw new Error('GitHub repository does not exist!');
          } else {
            throw new Error('Unexpected error while checking github repository');
          }
        });
        // no error retrieving repo (it exists)
        return true;
      },
    },
  },
  commitSHA: {
    type: String,
    minLength: 1,
    required: true,
    validate: {
      validator: async function validateGitHubURL(commitSHA) {
        const githubURL = new URL(this.githubURL);
        const [owner, repo] = githubURL.pathname.match(/[^/]+/g);
        await Promise.all([
          octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commitSHA, // commitSHA may also be a git branch name
          }).catch((error) => {
            if (error.status === StatusCodes.NOT_FOUND) {
              throw new Error('GitHub commit does not exist!');
            } else {
              throw new Error('Unexpected error while checking github commit');
            }
          }),
          octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'index.js',
            ref: commitSHA,
          }).catch((error) => {
            if (error.status === StatusCodes.NOT_FOUND) {
              throw new Error('index.js file does not exist! Make sure the commit is from the "published" branch!');
            } else {
              throw new Error('Unexpected error while getting the index.js file of build artifact');
            }
          }),
          octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'frontend/build',
            ref: commitSHA,
          }).catch((error) => {
            if (error.status === StatusCodes.NOT_FOUND) {
              throw new Error('frontend/build folder does not exist! Make sure your frontend is actually getting built on "published" branch!');
            } else {
              throw new Error('Unexpected error while getting the frontend/build folder');
            }
          }),
        ]);
        // no errors while retrieving commit or expected build artifact items
        return true;
      },
    },
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
    sparse: true,
    index: true,
    required: true,
    default() {
      // eslint-disable-next-line no-underscore-dangle
      return this._id.toString();
    },
    validate: {
      validator: (customURL) => /^[-0-9a-z]+$/.test(customURL) && customURL[customURL.length - 1] !== '-',
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
    customURL: this.customURL,
  };
});

GameSchema.pre('save', function onSave() {
  this.customURL = this.customURL.toLowerCase();
});

module.exports = mongoose.model('Game', GameSchema);
