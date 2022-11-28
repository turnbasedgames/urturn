import path from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';

// the default entry point will be index.js or index.ts
const DEFAULT_RELATIVE_ENTRYPOINT = 'index';

// Make sure any symlinks in the project folder are resolved
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  'js',
  'ts',
];

// Resolve a user module
const resolveModuleWithoutExtension = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(
    (ext) => fs.existsSync(resolveFn(`${filePath}.${ext}`)),
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

async function readJsonFile(filePath) {
  const file = await readFile(filePath, 'utf8');
  return JSON.parse(file);
}

const userPackageJsonPath = resolveApp('package.json');

// userBackendIndexPath points to the "index" file that is the result of rollup bundling.
// We use this file to watch and detect changes even though we import their entry point file
// (e.g. src/main.js).
export const userBackendIndexPath = resolveModuleWithoutExtension(
  resolveApp,
  DEFAULT_RELATIVE_ENTRYPOINT,
);
// TODO: this fn doesn't actually work because the "main" field determines where rollup puts
// the resulting index file! So we can't import based on the "main" field. We have to either
// a. add a new configuration field to determine which import we use
// b. add a new configuration for rollup (this won't work for existing users though)
export const getUserBackendPath = async () => {
  const pkgJson = await readJsonFile(userPackageJsonPath);
  const { main } = pkgJson;
  if (main == null) {
    return userBackendIndexPath;
  }
  return resolveApp(pkgJson);
};
