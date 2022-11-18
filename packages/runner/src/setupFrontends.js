import express from 'express';
import path from 'path';
import cors from 'cors';
import runnerFrontendBuildPath from '@urturn/runner-frontend';
import logger from './logger.js';

const setupFrontendService = (
  frontendPath,
  port,
  portForRunnerBackend,
  portForUserFrontend,
) => {
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
  logger.info(`serving ${frontendPath} at ${url}`);
  return () => server.close();
};

const setupFrontends = ({
  portForRunnerFrontend, portForUserFrontend, portForRunnerBackend,
}) => setupFrontendService(
  runnerFrontendBuildPath,
  portForRunnerFrontend,
  portForRunnerBackend,
  portForUserFrontend,
);

export default setupFrontends;
