import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
const isDev = process.env.NODE_ENV !== 'production';
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'DotMatrixMap'
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'DotMatrixMap',
      plugins: [terser()]
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    resolve(),
    json(),
    isDev && serve({
      port: 8000,
      contentBase: './',
      historyApiFallback: '/examples/index.html',
    }),
    isDev && livereload()
  ]
};