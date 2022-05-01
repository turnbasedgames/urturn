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

const clearConsole = () => {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H',
  );
};

module.exports = {
  stringIsAValidUrl,
  clearConsole,
};
