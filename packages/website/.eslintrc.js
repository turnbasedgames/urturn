module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [
    {
      // typescript files requires several overrides
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:react/recommended',
        'standard-with-typescript',
        'airbnb',
        'airbnb-typescript',
      ],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        // typescript makes these rules useless
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
  },
};
