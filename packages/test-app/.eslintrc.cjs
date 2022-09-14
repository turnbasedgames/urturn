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
    'import/extensions': 'off',
  },
};
