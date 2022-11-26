module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // disable extraneous dependencies, because when the package is deployed, only the build folder
    // is provided
    'import/no-extraneous-dependencies': 'off',
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  },
};
