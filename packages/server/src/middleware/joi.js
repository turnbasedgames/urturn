const { Joi } = require('celebrate');
const mongoose = require('mongoose');

const extendedJoi = Joi.extend({
  type: 'objectId',
  validate: (value, helpers) => {
    if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
      return { value: mongoose.Types.ObjectId(value) };
    }
    return { errors: helpers.error('Invalid ObjectID', { value }) };
  },
});

module.exports = extendedJoi;
