function addKVToObjectFactoryFn(filteredKeys) {
  return function addKVToObjectFn(obj) {
    const curObj = this;
    filteredKeys.forEach((key) => {
      if (key in obj) {
        curObj[key] = obj[key];
      }
    });
  };
}

function getKVToObjectFactoryFn(filteredKeys) {
  return function getKVT() {
    return filteredKeys.reduce((curObj, key) => {
      if (key in this) {
        return { ...curObj, [key]: this[key] };
      }
      return curObj;
    }, {});
  };
}

module.exports = {
  addKVToObjectFactoryFn,
  getKVToObjectFactoryFn,
};
