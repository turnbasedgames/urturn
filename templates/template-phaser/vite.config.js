import { defineConfig } from 'vite'

export default defineConfig({
	// Base must be './' so that when bundled, paths are relative.
	// UrTurn may serve the html5 files from a nested path.
  base: "./",
	plugins: [],
	server: { host: '0.0.0.0', port: 3000 },
	build: {
		outDir: 'build'
	},
	clearScreen: false,
})
