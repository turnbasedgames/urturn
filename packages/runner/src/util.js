const { URL } = require('url');

const stringIsAValidUrl = (s) => {
  try {
    // eslint-disable-next-line no-new
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  stringIsAValidUrl,
};
