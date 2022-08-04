const path = require('path');
const fs = require('fs');

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

module.exports = {
  buildPath: path.join(__dirname, '..', 'frontend', 'build'),
  userFrontendPath: resolveApp('frontend/build'),
  userBackend: resolveModule(resolveApp, 'index'),
};
