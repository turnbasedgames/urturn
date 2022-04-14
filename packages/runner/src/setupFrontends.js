const express = require('express');
const {
  buildPath,
  userFrontendPath,
} = require('../config/paths');

module.exports = {
  setupFrontends({ frontendEndUrl, tbgFrontendUrl }) {
    const setupFrontendService = (currentUrl, path, port) => {
      if (currentUrl) {
        return;
      }
      const app = express();
      app.use(express.static(path));
      const server = app.listen(port, () => {
        const url = `http://localhost:${server.address().port}`;
        console.log(`serving ${path} at ${url}`);
      });
    };

    setupFrontendService(frontendEndUrl, userFrontendPath, 3001);
    setupFrontendService(tbgFrontendUrl, buildPath, 3002);
  },
};
