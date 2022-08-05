const express = require('express');
const path = require('path');
const cors = require('cors');
const {
  buildPath,
  userFrontendPath,
} = require('../config/paths.cjs');

const setupFrontendService = (
  currentUrl,
  frontendPath,
  port,
  portForRunnerBackend,
  portForUserFrontend,
) => {
  if (currentUrl) {
    return () => {};
  }

  const app = express();
  app.use(cors());
  app.use(express.static(frontendPath));

  app.get('/.well-known/get-server-port', (req, res) => res.status(200).json({ backendPort: portForRunnerBackend }));

  app.get('/.well-known/get-frontend-port', (req, res) => res.status(200).json({ frontendPort: portForUserFrontend }));

  app.get('*', (_, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });

  const server = app.listen(port);
  const url = `http://localhost:${server.address().port}`;
  console.log(`serving ${frontendPath} at ${url}`);
  return () => server.close();
};

module.exports = {
  setupFrontends({
    frontendUrl, tbgFrontendUrl, portForRunnerFrontend, portForUserFrontend, portForRunnerBackend,
  }) {
    const cleanupFuncs = [
      setupFrontendService(
        tbgFrontendUrl,
        buildPath,
        portForRunnerFrontend,
        portForRunnerBackend,
        portForUserFrontend,
      ),
      setupFrontendService(frontendUrl, userFrontendPath, portForUserFrontend),
    ];

    return () => cleanupFuncs.forEach((cleanupFunc) => cleanupFunc());
  },
};
