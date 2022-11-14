const USD_TO_URBUX = {
  10: 1000,
};

const ALLOWED_CURRENCIES_SET = new Set(['usd']);

function convertAmountToUrbux(currency, amount) {
  let urbuxAmount;

  if (currency === 'usd') {
    const usd = amount / 100;
    urbuxAmount = USD_TO_URBUX[usd];
  }

  return urbuxAmount;
}

module.exports = { USD_TO_URBUX, ALLOWED_CURRENCIES_SET, convertAmountToUrbux };
