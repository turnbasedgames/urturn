const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const ServiceInstance = require('./serviceInstance');
const UserSocket = require('../user/userSocket');
const { deleteUserSocket } = require('../user/util');

const MAX_USER_SOCKETS_CLEANUP_PER_SERVICE = 10;
const MAX_SERVICE_INSTANCES_CLEANUP = 10;
const MAX_STALE_MINS = 10;

const PATH = '/instance';
const router = express.Router();

function setupRouter({ io, serviceInstanceId }) {
  router.get('/',
    asyncHandler(async (req, res) => {
      const serviceInstance = await ServiceInstance.findById(serviceInstanceId);
      res.status(StatusCodes.OK).json({ serviceInstance: serviceInstance.toJSON() });
    }));

  router.get('/date', asyncHandler(async (req, res) => {
    res.status(StatusCodes.OK).json({ date: new Date().toISOString() });
  }));

  // Cleans up all instances logged that are stale.
  // Designed to be called regularly by an external scheduled job.
  // WARNING: this endpoint is exposed publicly, and will be locked down in the future.
  // We only do work if our queries show there is a stale instance. So eager calls by potential
  // adversaries do not cost more than other endpoints.
  router.delete('/cleanup',
    asyncHandler(async (req, res) => {
      const now = new Date().getTime();
      const msPerMinute = 60 * 1000;
      const latestUpdatedAt = new Date(now - MAX_STALE_MINS * msPerMinute);
      req.log.info('looking for stale service instances', { latestUpdatedAt });
      const staleServiceInstances = await ServiceInstance
        .find({ updatedAt: { $lt: latestUpdatedAt } })
        .sort({ updatedAt: 1 }) // handle get the most stale first
        .limit(MAX_SERVICE_INSTANCES_CLEANUP)
        .exec();
      req.log.info('stale service instances to cleanup', {
        staleServiceInstances: staleServiceInstances
          .map((staleServiceInstance) => staleServiceInstance.toJSON()),
      });

      await Promise.all(staleServiceInstances.map(async (staleServiceInstance) => {
        const staleUserSockets = await UserSocket
          .find({ serviceInstance: staleServiceInstance.id })
          .populate('user')
          .sort({ updatedAt: 1 }) // handle get the most stale first
          .limit(MAX_USER_SOCKETS_CLEANUP_PER_SERVICE)
          .exec();
        req.log.info('stale sockets to cleanup', {
          staleUserSockets: staleUserSockets.map((staleUserSocket) => staleUserSocket.toJSON()),
        });
        if (staleUserSockets.length === 0) {
          req.log.info('deleting stale service instance:', { staleServiceInstance: staleServiceInstance.toJSON() });
          await staleServiceInstance.deleteOne();
        } else {
          await Promise.all(staleUserSockets.map(async (staleUserSocket) => {
            await deleteUserSocket(
              io,
              req.log,
              staleUserSocket.room,
              staleUserSocket.user,
              staleUserSocket.socketId,
            );
          }));
        }
      }));
      res.status(StatusCodes.OK).json({
        serviceInstanceCount: staleServiceInstances.length,
      });
    }));
  return router;
}

module.exports = {
  setupRouter,
  PATH,
};
