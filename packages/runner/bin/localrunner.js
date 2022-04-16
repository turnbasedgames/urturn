#!/usr/bin/env node
const { program, Option } = require('commander');
const { stringIsAValidUrl } = require('../src/util');
const { setupFrontends } = require('../src/setupFrontends');
// TODO: MAIN-83 setup dev environment option for a local dummy user frontend and backend
// TODO: MAIN-84 handle when ports are taken in elegant way
// (react-scripts start prompts user with Y/n question to auto choose available port)
const { setupServer } = require('../src/setupServer');

program
  .addOption(new Option('-t, --tbg-frontend-url <tbgFrontendUrl>').hideHelp())
  .addOption(new Option('-e, --empty-backend').hideHelp())
  // TODO: MAIN-85 tbg frontend needs to query for this value
  // this enables users of react js to be able to hot reload their frontend used by localrunner
  // if this is not enabled then we serve the files in the user's project "frontend/bulid"
  .option('-f, --frontend-url <frontendUrl>', 'if you are already serving your frontend in a dev environment (e.g. React), you can specify the url here')
  .option('-d, --debug', 'print debug logs to stdout'); // TODO: MAIN-86 we need to use a logger instead of console.log and add debug log outputs everywhere

program.parse();
const options = program.opts();

console.log(options);

// validate options
if (options.tbgFrontendUrl) {
  if (!stringIsAValidUrl(options.tbgFrontendUrl)) {
    throw new Error(`Invalid '--tbg-frontend-url' option provided: ${options.tbgFrontendUrl}`);
  }
}
if (options.frontendEndUrl) {
  if (!stringIsAValidUrl(options.frontendEndUrl)) {
    throw new Error(`Invalid '--frontend-url' option provided: ${options.frontendEndUrl}`);
  }
}

setupFrontends({ frontendEndUrl: options.frontendEndUrl, tbgFrontendUrl: options.tbgFrontendUrl });
setupServer(options.emptyBackend);
