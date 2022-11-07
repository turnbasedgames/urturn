module.exports = {
  ignorePatterns: [
    'frontend', // frontend folder has it's own eslint config
  ],
  env: {
    commonjs: true,
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
  },
};
