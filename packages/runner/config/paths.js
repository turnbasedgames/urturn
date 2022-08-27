import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const parentFolder = path.dirname(fileURLToPath(import.meta.url));

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

export const buildPath = path.join(parentFolder, '..', 'frontend', 'build');
export const userFrontendPath = resolveApp('frontend/build');
export const userBackend = resolveModule(resolveApp, 'index');
