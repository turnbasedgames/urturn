#!/usr/bin/env node
import { program, Option } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { exec, execSync } from 'child_process';
import getPort from 'get-port';
import inquirer from 'inquirer';
import degit from 'degit';
import { isInteger, clearConsole } from '../src/util.js';
import setupFrontends from '../src/setupFrontends.js';
import setupServer from '../src/setupServer.js';

const templateBackendRepo = 'turnbasedgames/urturn/templates/template-backend';
const templateFrontendRepoPrefix = 'turnbasedgames/urturn/templates/template-';

async function start(options) {
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

      console.warn('exiting runner');
      process.exit();
    });
  });
}

async function init(destination, { commit }) {
  const { frontendType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'frontendType',
      message: "Which game frontend do you want to use? (don't see your frontend, add it in a PR!)",
      default: 'ReactJS',
      choices: [
        { name: 'ReactJS', value: 'react' },
        { name: 'None', value: 'none' },
      ],
    },
  ]);
  const commitSuffix = commit == null ? '' : `#${commit}`;
  const templateFrontendPath = templateFrontendRepoPrefix + frontendType + commitSuffix;
  const templateBackendPath = templateBackendRepo + commitSuffix;
  const templateBackendEmitter = degit(templateBackendPath);
  const templateFrontendEmitter = degit(templateFrontendPath);

  await templateBackendEmitter.clone(destination);
  const frontendPath = `${destination}/frontend`;
  await templateFrontendEmitter.clone(frontendPath);
  const extraBackendPackages = ['@urturn/runner'];
  const extraFrontendPackages = ['@urturn/client'];
  execSync(`npm i ${extraBackendPackages.join(' ')} --no-audit --save --save-exact --loglevel error`, { cwd: destination, stdio: 'inherit' });
  execSync(`npm i ${extraFrontendPackages.join(' ')} --no-audit --save --save-exact --loglevel error`, { cwd: frontendPath, stdio: 'inherit' });
  console.log('\n\nSuccessfully created template UrTurn game. Happy hacking!');
  console.log("Don't forget to share your creations in our discord! https://discord.gg/myWacjdb5S");
  console.log(`Try running "cd ${destination} && npm run dev".`);
}

async function main() {
  program
    .command('init <destination>')
    .description('initialize a new UrTurn Game')
    // hide UrTurn dev only options
    .addOption(new Option('--commit <commit>', 'custom commit or branch to run init from').hideHelp())
    .action(init);

  program
    .command('start', { isDefault: true })
    .description('starts the local runner serving the console and backend')
    // hide UrTurn dev only options
    .addOption(new Option('--dev').hideHelp())
    .addOption(new Option('--no-clear', "Don't clear console when starting the runner."))
    .requiredOption('-f, --frontend-port <frontendPort>', 'Specify the port of where the frontend of your game is being hosted locally.')
    // TODO: MAIN-86 we need to use a logger instead of console.log and add debug log outputs
    // everywhere
    .option('-d, --debug', 'print debug logs to stdout')
    .action(start);

  program.parse();
}

main();
