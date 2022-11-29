const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const ServiceInstance = require('./serviceInstance');

const PATH = '/instance';
const router = express.Router();

function setupRouter({ serviceInstanceId }) {
  router.get('/',
    asyncHandler(async (req, res) => {
      const serviceInstance = await ServiceInstance.findById(serviceInstanceId);
      res.status(StatusCodes.OK).json({ serviceInstance });
    }));
  return router;
}

module.exports = {
  setupRouter,
  PATH,
};
