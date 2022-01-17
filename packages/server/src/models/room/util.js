function addKVToObjectFactoryFn(filteredKeys) {
  return function addKVTobjectFn(obj) {
    const curObj = this;
    filteredKeys.forEach((key) => {
      if (key in obj) {
        curObj[key] = obj[key];
      }
    });
  };
}

module.exports = {
  addKVToObjectFactoryFn,
};
