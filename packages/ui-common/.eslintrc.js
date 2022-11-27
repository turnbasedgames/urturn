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
        'plugin:storybook/recommended',
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      rules: {
        // typescript makes prop-types and require-default-props rules useless
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.@(stories|test).@(ts|tsx|xjs|jsx|mjs|cjs)'],
          },
        ],
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
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  },
};
