import logger from '../logger.js';

export default (handler) => {
  const handleError = (err) => {
    logger.error('Unhandled error on socket event', err);
  };

  return (...args) => {
    try {
      const ret = handler.apply(this, args);
      if (ret && typeof ret.catch === 'function') {
        // async handler
        ret.catch(handleError);
      }
    } catch (e) {
      // sync handler
      handleError(e);
    }
  };
};
