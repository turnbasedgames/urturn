const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const PasswordValidator = require('password-validator');

const { model, Schema } = mongoose;

const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)
  .is().max(32)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .symbols(1)
  .not()
  .spaces();

const schema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    uniqueCaseInsensitive: true,
    validate: validator.isEmail,
  },
  username: { // TODO: validation (16 char max, alphanumeric, case insensitive or "casefold")
    type: String,
    unique: true,
    uniqueCaseInsensitive: true,
    required: true,
  },
  // TODO: save history of passwords so user doesn't set to same password as before
  password: {
    type: String,
    required: true,
    select: false,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
});

schema.plugin(uniqueValidator);

schema.pre('save', async function preSave() {
  if (this.isModified('password')) {
    const errors = passwordSchema.validate(this.password, { list: true });
    if (errors.length === 0) {
      const hash = await bcrypt.hash(this.password, 10);
      this.password = hash;
    } else {
      throw Error(`Invalid Password: ${errors.join(', ')}`);
    }
  }
});

schema.method('authenticate', function authenticate(password) {
  return bcrypt.compare(password, this.password);
});

schema.method('toJSON', function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.__v; // eslint-disable-line no-underscore-dangle
  return user;
});

module.exports = model('User', schema);
