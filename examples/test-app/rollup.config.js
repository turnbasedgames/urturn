import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/main.js',
  external: ['ms'],
  output: { file: pkg.main, format: 'cjs' },
};
