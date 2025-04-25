import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/pagesnap.js',
  output: [
    {
      file: 'dist/pagesnap.min.js',
      format: 'umd',
      name: 'pagesnap',
      globals: {
        'lodash.throttle': 'throttle',
        'tinygesture': 'TinyGesture',
      },
    },
  ],
  plugins: [
    resolve(),    // 👉 lets Rollup find node_modules
    commonjs(),   // 👉 converts CommonJS to ES modules
    terser(),     // 👉 minify
  ],
};