/* eslint-disable import/no-extraneous-dependencies */
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './index.js',
  output: {
    dir: "dist",
    format: "cjs",
    exports: "named",
    preserveModules: true, // Keep directory structure and files
  },
  plugins: [nodeResolve(), commonjs(), json()],
};
