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
import { DISCORD_URL, DOCS_URL } from '@urturn/types-common';
import checkNodeVersion from 'check-node-version';
import logger from '../src/logger.js';
import { isInteger, clearConsole } from '../src/util.js';
import setupFrontends from '../src/setupFrontends.js';
import setupServer from '../src/setupServer.js';

const require = createRequire(import.meta.url);
// avoid experimental json import warnings https://stackoverflow.com/questions/66726365/how-should-i-import-json-in-node
const pkg = require('../package.json');

const DEFAULT_GIT_URL = 'https://github.com/turnbasedgames/urturn';
const DEFAULT_GIT_BRANCH = 'main';
const templateBackendPath = '/templates/template-backend';
const templateFrontendRepoPrefix = '/templates/template-';
const tutorialBasePath = '/examples/';

function wrapVersion(fn) {
  return (...args) => {
    // log version by default to help debug user related questions and bug reports
    logger.info(`${pkg.name} ${chalk.bold(`v${pkg.version}`)}`);

    checkNodeVersion(pkg.engines, (error, result) => {
      if (error) {
        logger.info(`${chalk.red('Unexpected Error')}: ${error}`);
      } else if (!result.isSatisfied) {
        Object.keys(result.versions).forEach((packageName) => {
          if (!result.versions[packageName].isSatisfied) {
            const curVersion = result.versions[packageName].version;
            const wanted = result.versions[packageName].wanted?.range;
            logger.info(`${chalk.red('Error')}: Invalid version ${chalk.yellow(`${packageName}@${curVersion}`)}, should be ${chalk.green(wanted)}.`);
          }
        });
      } else {
        fn(...args);
      }
    });
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

      logger.warn('exiting runner');
      process.exit();
    });
  });
}

function getFrontendPathFromDest(destination) {
  return `${destination}/frontend`;
}

async function setupProjectFiles({
  gitUrl, destination, tutorial, commit,
}) {
  const frontendPath = getFrontendPathFromDest(destination);
  const commitSuffix = commit == null ? '' : `#${commit}`;
  logger.info('');
  if (tutorial) {
    const comingSoonTutorials = new Set(['semantle-battle-tutorial', 'chess-timer-tutorial']);
    const { tutorialType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tutorialType',
        message: 'Which game tutorial are you doing? (Want another tutorial, Add a PR!)',
        default: 'TicTacToe',
        choices: [
          { name: 'TicTacToe', value: 'tictactoe-tutorial' },
          { name: 'Chess', value: 'chess-tutorial' },
          { name: '🚧 Chess with Timer (Coming soon!)', value: 'chess-timer-tutorial' },
          { name: '🚧 Semantle Battle (Coming soon!)', value: 'semantle-battle-tutorial' },
        ],
      },
    ]);
    if (comingSoonTutorials.has(tutorialType)) {
      throw new Error("Tutorial doesn't exist yet! It is coming soon! 🚧");
    } else {
      const tutorialPath = tutorialBasePath + tutorialType;
      const tutorialDegitUrl = gitUrl + tutorialPath + commitSuffix;
      logger.info(`Downloading tutorial from ${gitUrl}/tree/${commit}${tutorialPath}...`);
      const tutorialEmitter = degit(tutorialDegitUrl);
      await tutorialEmitter.clone(destination);
    }
  } else {
    const { frontendType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'frontendType',
        message: "Which game frontend do you want to use? (don't see your frontend, add it in a PR!)",
        default: 'ReactJS',
        choices: [
          { name: 'ReactJS', value: 'none' },
          { name: 'PhaserIO (created by Enjoy2Live)', value: 'phaser' },
          { name: 'PixiJS', value: 'pixi' },
          { name: 'None', value: 'none' },
        ],
      },
    ]);
    const templateFrontendPath = templateFrontendRepoPrefix + frontendType;
    const templateFrontendDegitUrl = gitUrl + templateFrontendPath + commitSuffix;
    const templateBackendDegitUrl = gitUrl + templateBackendPath + commitSuffix;
    const templateBackendEmitter = degit(templateBackendDegitUrl);
    const templateFrontendEmitter = degit(templateFrontendDegitUrl);

    logger.info(`\nCreating new UrTurn game at ${chalk.greenBright(destination)}\n`);
    logger.info(`[1/2] 💾 Downloading ${chalk.bold('backend template')} from ${gitUrl}/tree/${commit}${templateBackendPath}`);
    await templateBackendEmitter.clone(destination);
    logger.info(`[2/2] 🎮 Downloading ${chalk.bold('frontend template')} from ${gitUrl}/tree/${commit}${templateFrontendPath}`);
    await templateFrontendEmitter.clone(frontendPath);
  }
}

async function init(destination, { commit, tutorial, gitUrl }) {
  const fullPathDestination = path.resolve(destination);
  const frontendPath = getFrontendPathFromDest(destination);
  await setupProjectFiles({
    gitUrl,
    destination,
    commit,
    tutorial,
  });

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
  logger.info(`Go to ${chalk.magenta.underline(DISCORD_URL)} for questions, game jams, meeting other developers, and more!`);
  logger.info('Happy Hacking!!');
}

async function main() {
  program.version(pkg.version, '-v, --version', 'output the current version');
  program.addHelpText('afterAll', `\nAsk questions at ${DISCORD_URL}`);

  program
    .command('init <destination>')
    .description('initialize a new UrTurn Game')
    .addOption(new Option('-t, --tutorial', `initialize a UrTurn tutorial game (see ${DOCS_URL}docs/category/getting-started)`))
    // hide UrTurn dev only options
    .addOption(new Option('--commit <commit>', 'custom commit or branch to run init from')
      .default(DEFAULT_GIT_BRANCH)
      .hideHelp())
    .addOption(new Option('--git-url <git-url>', 'custom forked repo to get templates or tutorials from')
      .default(DEFAULT_GIT_URL)
      .hideHelp())
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
