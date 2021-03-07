const mongoose = require('mongoose');
const admin = require('firebase-admin');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firebaseId: {
    type: String,
    required: true,
    max: 128,
    unique: true, // not enforced?
    index: true,
  },
  signInProvider: {
    type: String,
    required: true,
  },
}, { timestamps: true });

UserSchema.plugin(uniqueValidator);
UserSchema.methods.getFirebaseUser = () => admin.auth().getUser(this.firebaseId);

module.exports = mongoose.model('User', UserSchema);
