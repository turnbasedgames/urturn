const mongoose = require('mongoose');
const admin = require('firebase-admin');
const uniqueValidator = require('mongoose-unique-validator');

const { getKVToObjectFactoryFn } = require('../util');

const { Schema } = mongoose;

const CREATOR_VIEWABLE_KEYS = ['id', 'username'];
const UserSchema = new Schema({
  firebaseId: {
    type: String,
    required: true,
    max: 128,
    unique: true,
    index: true,
  },
  signInProvider: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    min: 4,
    max: 32,
    index: true,
    lowercase: true,
    trim: true,
  },
  urbux: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: (urbux) => Number.isInteger(urbux) && urbux >= 0,
      message: '{VALUE} is not a non-negative integer value',
    },
    private: true,
  },
}, { timestamps: true });

UserSchema.plugin(uniqueValidator);
UserSchema.method('getCreatorDataView', getKVToObjectFactoryFn(CREATOR_VIEWABLE_KEYS));
UserSchema.methods.getFirebaseUser = () => admin.auth().getUser(this.firebaseId);
UserSchema.method('toJSON', function toJSON(options) {
  const { includePrivate } = options;

  const json = {
    id: this.id,
    firebaseId: this.firebaseId,
    signInProvider: this.signInProvider,
    username: this.username,
  };

  if (includePrivate) {
    Object.keys(this.toObject()).forEach((key) => {
      if (UserSchema.paths[key].options?.private) {
        json[key] = this[key];
      }
    });
  }
  return json;
});

module.exports = mongoose.model('User', UserSchema);
