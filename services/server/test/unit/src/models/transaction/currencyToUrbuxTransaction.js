const test = require('ava');
const mongoose = require('mongoose');

const CurrencyToUrbuxTransaction = require('../../../../../src/models/transaction/currencyToUrbuxTransaction');
const { getNested } = require('../../../../util/util');
const { USD_TO_URBUX } = require('../../../../../src/models/transaction/util');

const possibleUrbuxDenominations = Object.values(USD_TO_URBUX);

test('USD_TO_URBUX should have at least one denomination', (t) => {
  t.true(possibleUrbuxDenominations > 0);
});

test('USD_TO_URBUX should only have urbux denominations that are positive integers', (t) => {
  possibleUrbuxDenominations.forEach((urbuxAmnt) => {
    t.true(Number.isInteger(urbuxAmnt));
    t.true(urbuxAmnt > 0);
  });
});

test('CurrencyToUrbuxTransaction model', (t) => {
  possibleUrbuxDenominations.forEach((urbuxAmnt) => {
    const transaction = new CurrencyToUrbuxTransaction({
      user: new mongoose.Types.ObjectId(),
      urbux: urbuxAmnt,
      paymentIntentId: 'somePaymentIntentId',
      paymentIntent: { id: 'somePaymentIntentId' },
    });
    const error = transaction.validateSync();
    t.is(error, undefined);
    t.is(transaction.urbux, urbuxAmnt);
    t.is(transaction.paymentIntentId, 'somePaymentIntentId');
    t.deepEqual(transaction.paymentIntent, { id: 'somePaymentIntentId' });
  });
});

test('CurrencyToUrbuxTransaction model fails validation for non-negative integer for urbux that is not the correct denomiation', (t) => {
  const invalidUrbuxValues = [-1, 0.05, 1.0001, 'string', undefined, {}, [], 101, 99, 10000];
  invalidUrbuxValues.forEach((urbux) => {
    const transaction = new CurrencyToUrbuxTransaction({
      user: new mongoose.Types.ObjectId(),
      urbux,
      paymentIntentId: 'somePaymentIntentId',
      paymentIntent: { id: 'somePaymentIntentId' },
    });
    const error = transaction.validateSync();
    t.not(error, undefined, `expected error with urbux value: ${urbux}`);
    t.not(getNested(error, 'errors', 'urbux'), undefined, `expected error object to have an error for urbux ${error}`);
  });
});

test('CurrencyToUrbuxTransaction model paymentIntentId must be the same as paymentIntent.id', (t) => {
  const transaction = new CurrencyToUrbuxTransaction({
    user: new mongoose.Types.ObjectId(),
    urbux: 100,
    paymentIntentId: 'somePaymentIntentId',
    paymentIntent: { id: 'badPayementIntentId' },
  });
  const error = transaction.validateSync();
  t.not(error, undefined, 'expected error with paymentIntentId and paymentIntent because ids are different');
  t.not(getNested(error, 'errors', 'paymentIntentId'), undefined, `expected error object to have an error for paymentIntentId ${error}`);
  t.not(getNested(error, 'errors', 'paymentIntent'), undefined, `expected error object to have an error for paymentIntent ${error}`);
});
