import path from 'path';
import fs from 'fs';

// Make sure any symlinks in the project folder are resolved
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  'js',
  'ts',
];

// Resolve a user module
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(
    (ext) => fs.existsSync(resolveFn(`${filePath}.${ext}`)),
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// eslint-disable-next-line import/prefer-default-export
export const userBackend = resolveModule(resolveApp, 'index');
