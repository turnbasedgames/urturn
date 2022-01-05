class RoomNotJoinableError extends Error {
  constructor(room) {
    super(`${room.id} is not joinable!`);
    this.name = 'RoomNotJoinableError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

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
  RoomNotJoinableError,
  addKVToObjectFactoryFn,
};
