#!/usr/bin/env node
import { program, Option } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { exec } from 'child_process';
import getPort from 'get-port';
import { stringIsAValidUrl, clearConsole } from '../src/util.js';
import setupFrontends from '../src/setupFrontends.js';
import setupServer from '../src/setupServer.js';

// TODO: MAIN-83 setup dev environment option for a local dummy user frontend and backend
(async () => {
  program
    .addOption(new Option('-t, --tbg-frontend-url <tbgFrontendUrl>').hideHelp())
    .addOption(new Option('-e, --empty-backend').hideHelp())
    .addOption(new Option('--dev').hideHelp())
    // TODO: MAIN-85 tbg frontend needs to query for this value
    // this enables users of react js to be able to hot reload their frontend used by runner
    // if this is not enabled then we serve the files in the user's project "frontend/bulid"
    .option('-f, --frontend-port <frontendPort>', 'if you are already serving your frontend in a dev environment (e.g. React), you can specify the port here')
    .option('-d, --debug', 'print debug logs to stdout') // TODO: MAIN-86 we need to use a logger instead of console.log and add debug log outputs everywhere
    .option('-D, --disable-open', 'Disable opening the runner automatically. User must navigate to url of runner');

  program.parse();
  const options = program.opts();

  // validate options
  if (options.tbgFrontendUrl) {
    if (!stringIsAValidUrl(options.tbgFrontendUrl)) {
      throw new Error(`Invalid '--tbg-frontend-url' option provided: ${options.tbgFrontendUrl}`);
    }
  }
  if (options.frontendUrl) {
    if (!stringIsAValidUrl(options.frontendUrl)) {
      throw new Error(`Invalid '--frontend-url' option provided: ${options.frontendUrl}`);
    }
  }

  const portForUserFrontend = options.frontendPort ?? await getPort({ port: 3000 });
  const portForRunnerBackend = await getPort({ port: 3100 });
  const portForRunnerFrontend = await getPort({ port: portForRunnerBackend + 1 });

  const runnerUrl = `http://localhost:${portForRunnerFrontend}`;
  const userFrontendURL = options.frontendPort && `http://localhost:${portForUserFrontend}`;
  const runnerFrontendURL = options.tbgFrontendUrl;

  clearConsole();
  console.log(chalk.gray('Starting runner with your game...\n'));
  console.log('running with options:', options);

  const cleanupServerFunc = await setupServer({
    isEmptyBackend: options.emptyBackend,
    apiPort: portForRunnerBackend,
  });

  let cleanupFrontendsFunc;
  let runnerFrontendProcess;
  let userFrontendProcess;

  if (options.dev) {
    userFrontendProcess = exec(`cd test_app/frontend && BROWSER=None PORT=${portForUserFrontend} npm start`);
    userFrontendProcess.stdout.pipe(process.stdout);

    runnerFrontendProcess = exec(`cd frontend && PORT=${portForRunnerFrontend} REACT_APP_USER_PORT=${portForUserFrontend} REACT_APP_BACKEND_PORT=${portForRunnerBackend} npm start`);
    runnerFrontendProcess.stdout.pipe(process.stdout);
  } else {
    cleanupFrontendsFunc = setupFrontends({
      frontendUrl: userFrontendURL,
      tbgFrontendUrl: runnerFrontendURL,
      portForRunnerFrontend,
      portForUserFrontend,
      portForRunnerBackend,
    });
  }

  console.log(`${chalk.green('\nYou can now view the runner in the browser at:')} \n${chalk.green.bold(runnerUrl)}`);

  if (!options.disableOpen) {
    open(runnerUrl);
  }

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => {
      cleanupServerFunc();
      if (cleanupFrontendsFunc) {
        cleanupFrontendsFunc();
      }

      if (runnerFrontendProcess) {
        runnerFrontendProcess.kill();
      }

      if (userFrontendProcess) {
        userFrontendProcess.kill();
      }

      process.exit();
    });
  });
})();
