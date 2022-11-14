const mongoose = require('mongoose');
const { USD_TO_URBUX } = require('./util');

const { Schema } = mongoose;

const CurrencyToUrbuxTransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  urbux: {
    type: Number,
    required: true,
    validate: {
      validator: (urbux) => Number.isInteger(urbux)
                            && urbux >= 0
                            && Object.values(USD_TO_URBUX).includes(urbux),
      message: `{VALUE} is not a non-negative integer value and can only be one of: ${Object.values(USD_TO_URBUX).join(',')}`,
    },
  },
  // This should be the same as paymentIntent.id
  // De-normalized, so that we can create an index off of this field to make it easier to search
  paymentIntentId: {
    type: Schema.Types.String,
    required: true,
    index: true,
    unique: true,
    validate: {
      validator(paymentIntentId) {
        return this.paymentIntent.id === paymentIntentId;
      },
      message: '{VALUE} is not the same as this.paymentIntent.id',
    },
  },
  // We don't validate the paymentIntent object, it is kept for book keeping cases
  // and should take the form https://stripe.com/docs/api/payment_intents/object
  paymentIntent: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator(paymentIntent) {
        return paymentIntent.id === this.paymentIntentId;
      },
      message: '{VALUE} is not the same as paymentIntentId',
    },
  },
}, { timestamps: true });

CurrencyToUrbuxTransactionSchema.index({ user: 1, paymentIntentId: 1 });

module.exports = mongoose.model('CurrencyToUrbuxTransaction', CurrencyToUrbuxTransactionSchema);
