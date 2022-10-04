#!/usr/bin/env node
import { program, Option } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { exec } from 'child_process';
import getPort from 'get-port';
import { isInteger, clearConsole } from '../src/util.js';
import setupFrontends from '../src/setupFrontends.js';
import setupServer from '../src/setupServer.js';

// TODO: MAIN-83 setup dev environment option for a local dummy user frontend and backend
(async () => {
  program
    // hide UrTurn dev only options
    .addOption(new Option('--dev').hideHelp())
    .addOption(new Option('--no-clear', "Don't clear console when starting the runner."))
    .requiredOption('-f, --frontend-port <frontendPort>', 'Specify the port of where the frontend of your game is being hosted locally.')
    // TODO: MAIN-86 we need to use a logger instead of console.log and add debug log outputs
    // everywhere
    .option('-d, --debug', 'print debug logs to stdout');

  program.parse();
  const options = program.opts();

  // validate options
  if (!isInteger(options.frontendPort)) {
    throw new Error(`Invalid '--frontend-port' option provided: ${options.frontendUrl}`);
  }

  const portForRunnerBackend = await getPort({ port: 3100 });
  const portForRunnerFrontend = await getPort({ port: portForRunnerBackend + 1 });

  const runnerUrl = `http://localhost:${portForRunnerFrontend}`;

  if (options.noClear) {
    clearConsole();
  }
  console.log(chalk.gray('Starting runner with your game...\n'));
  console.log('running with options:', options);

  const cleanupServerFunc = await setupServer({ apiPort: portForRunnerBackend });

  let cleanupFrontendsFunc;
  let runnerFrontendProcess;
  if (options.dev) {
    runnerFrontendProcess = exec(`PORT=${portForRunnerFrontend} REACT_APP_USER_PORT=${options.frontendPort} REACT_APP_BACKEND_PORT=${portForRunnerBackend} npx lerna run start --scope="@urturn/runner-frontend"`);
    runnerFrontendProcess.stdout.pipe(process.stdout);
  } else {
    cleanupFrontendsFunc = setupFrontends({
      portForRunnerFrontend,
      portForUserFrontend: options.frontendPort,
      portForRunnerBackend,
    });
    console.log(`${chalk.green('\nYou can now view the runner in the browser at:')} \n${chalk.green.bold(runnerUrl)}`);
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

      process.exit();
    });
  });
})();
