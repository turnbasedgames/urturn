// This module has to be common js to use the "require" variable
module.exports = {
  cleanupCommonJSModule: (path) => {
    delete require.cache[require.resolve(path)];
  },
};
