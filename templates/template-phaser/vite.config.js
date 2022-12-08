import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [],
	server: { host: '0.0.0.0', port: 3000 },
	build: {
		outDir: 'build'
	},
	clearScreen: false,
})