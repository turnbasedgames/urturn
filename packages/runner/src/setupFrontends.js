const express = require('express');
const path = require('path');
const cors = require('cors');
const {
  buildPath,
  userFrontendPath,
} = require('../config/paths');

const setupFrontendService = (currentUrl, frontendPath, port) => {
  if (currentUrl) {
    return;
  }
  const app = express();
  app.use(cors());
  app.use(express.static(frontendPath));
  app.get('*', (_, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
  const server = app.listen(port, () => {
    const url = `http://localhost:${server.address().port}`;
    console.log(`serving ${frontendPath} at ${url}`);
  });
};

module.exports = {
  setupFrontends({ frontendUrl, tbgFrontendUrl }) {
    setupFrontendService(tbgFrontendUrl, buildPath, 3100);
    setupFrontendService(frontendUrl, userFrontendPath, 3101);
  },
};
