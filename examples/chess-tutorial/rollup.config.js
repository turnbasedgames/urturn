const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const pkg = require('./package.json');

module.exports = [
  {
    input: 'src/main.js',
    external: ['ms'],
    output: {
      file: pkg.main,
      format: 'cjs',
      // @urturn/runner uses the sourcemap to provide correct error traces
      sourcemap: true,
    },
    // plugins that allow the src/main.js file require various npm packages
    // WARNING: packages that access the network, disk/file system will not work.
    plugins: [resolve(), commonjs()],
  },
];
