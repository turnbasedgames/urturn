module.exports = {
  ignorePatterns: [
    'frontend', // frontend folder has it's own eslint config
  ],
  env: {
    commonjs: false,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  },
};
