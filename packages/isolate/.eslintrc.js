module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	overrides: [
		{
			// Typescript files requires several overrides
			files: ['*.ts', '*.tsx'],
			extends: [
				'standard-with-typescript',
				'airbnb',
				'airbnb-typescript',
			],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
	rules: {
		'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
	},
};

