const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const pkg = require('./package.json');

module.exports = {
  input: 'src/main.js',
  external: ['ms'],
  output: [
    { file: pkg.main, format: 'cjs' },
  ],
  plugins: [resolve(), commonjs()],
};
