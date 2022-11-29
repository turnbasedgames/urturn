const ServiceInstance = require('./serviceInstance');
const logger = require('../../logger');

// how frequently to update the ping count for a service instance
const PING_INTERVAL_MS = 10000;

async function startServiceInstancePingChain(instId) {
  try {
    const result = await ServiceInstance.findByIdAndUpdate(
      instId,
      { $inc: { pingCount: 1 } },
      { rawResult: true },
    );
    logger.info('Result of updating serviceInstance pingCount', result.lastErrorObject);
  } catch (error) {
    logger.error('Error when trying to update pingCount for serviceInstance!', error);
  }
  setTimeout(() => {
    startServiceInstancePingChain(instId);
  }, PING_INTERVAL_MS);
}

module.exports = {
  startServiceInstancePingChain,
};
