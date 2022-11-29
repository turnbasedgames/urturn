const ServiceInstance = require('./serviceInstance');

// how frequently to update the ping count for a service instance
const PING_INTERVAL_MS = 10000;

async function startServiceInstancePingChain(instId) {
  await ServiceInstance.findByIdAndUpdate(instId, { $inc: { pingCount: 1 } });
  setTimeout(() => {
    startServiceInstancePingChain(instId);
  }, PING_INTERVAL_MS);
}

module.exports = {
  startServiceInstancePingChain,
};
