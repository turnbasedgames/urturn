const pkg = require('./package.json');

module.exports = [

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/main.js',
    external: ['ms'],
    output: [
      { file: pkg.main, format: 'cjs' },
    ],
  },
];
