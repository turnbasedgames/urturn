module.exports = {
  ignorePatterns: [
    'frontend', // frontend folder has it's own eslint config
  ],
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'import/extensions': 'off',
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  },
};
