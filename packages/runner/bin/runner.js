#!/usr/bin/env node

import { program, Option } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { exec, execSync } from 'child_process';
import getPort from 'get-port';
import inquirer from 'inquirer';
import degit from 'degit';
import path from 'path';
import { createRequire } from 'module';
import logger from '../src/logger.js';
import { isInteger, clearConsole } from '../src/util.js';
import setupFrontends from '../src/setupFrontends.js';
import setupServer from '../src/setupServer.js';

const require = createRequire(import.meta.url);
// avoid experimental json import warnings https://stackoverflow.com/questions/66726365/how-should-i-import-json-in-node
const pkg = require('../package.json');

const templateBackendRepo = 'turnbasedgames/urturn/templates/template-backend';
const templateFrontendRepoPrefix = 'turnbasedgames/urturn/templates/template-';

function wrapVersion(fn) {
  return (...args) => {
    // log version by default to help debug user related questions and bug reports
    logger.info(`${pkg.name} v${pkg.version}`);
    return fn(...args);
  };
}

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
  logger.info(chalk.gray('Starting runner with your game...\n'));
  logger.info('running with options:', options);

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
    logger.info(`${chalk.green('\nYou can now view the runner in the browser at:')} \n${chalk.green.bold(runnerUrl)}`);
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
  const fullPathDestination = path.resolve(destination);
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

  logger.info('Downloading backend template...');
  await templateBackendEmitter.clone(destination);
  const frontendPath = `${destination}/frontend`;
  logger.info('Downloading frontend template...');
  await templateFrontendEmitter.clone(frontendPath);
  const extraBackendPackages = ['@urturn/runner'];
  const extraFrontendPackages = ['@urturn/client'];
  logger.info('\nInstalling packages. This might take a couple of minutes.');
  logger.info(`Installing ${[...extraBackendPackages, ...extraFrontendPackages].map(((extraPkg) => chalk.cyan(extraPkg))).join(', ')}, and more...\n`);
  execSync(`npm i ${extraBackendPackages.join(' ')} --no-audit --save --save-exact --loglevel error`, { cwd: destination, stdio: 'inherit' });
  execSync(`npm i ${extraFrontendPackages.join(' ')} --no-audit --save --save-exact --loglevel error`, { cwd: frontendPath, stdio: 'inherit' });
  logger.info(`\n\n${chalk.green('Successfully')} created UrTurn game at ${chalk.white.underline(fullPathDestination)}`);
  logger.info(`\n${chalk.bold('Get Started:')}`);
  logger.info(`\n  ${chalk.cyan('cd')} ${destination}`);
  logger.info(`  ${chalk.cyan('npm run dev')}\n`);
  logger.info(`Go to ${chalk.magenta.underline('https://discord.gg/myWacjdb5S')} for questions, game jams, meeting other developers, and more!`);
  logger.info('Happy Hacking!!');
}

async function main() {
  program.version(pkg.version, '-v, --version', 'output the current version');

  program
    .command('init <destination>')
    .description('initialize a new UrTurn Game')
    // hide UrTurn dev only options
    .addOption(new Option('--commit <commit>', 'custom commit or branch to run init from').hideHelp())
    .action(wrapVersion(init));

  program
    .command('start', { isDefault: true })
    .description('starts the local runner serving the console and backend')
    // hide UrTurn dev only options
    .addOption(new Option('--dev').hideHelp())
    .addOption(new Option('--no-clear', "Don't clear console when starting the runner."))
    .requiredOption('-f, --frontend-port <frontendPort>', 'Specify the port of where the frontend of your game is being hosted locally.')
    .action(wrapVersion(start));
  program.parse();
}

main();
