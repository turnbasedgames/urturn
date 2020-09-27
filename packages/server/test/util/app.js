require('./absolutePath');

const setupLoaders = require('src/loaders');

function cleanup(loaders) {
  return () => {
    loaders.wss.close();
  };
}

function setup() {
  const loaders = setupLoaders(0);
  return { ...loaders, cleanup: cleanup(loaders) };
}

module.exports = setup;
