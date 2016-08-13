import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
// import istanbul from 'rollup-plugin-istanbul';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

let pkg = require('./package.json');
// let external = Object.keys(pkg.dependencies);

export default {
  entry: 'lib/index.js',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      include: 'node_modules/**'  // Default: undefined
    }),

    babel(babelrc())
    // istanbul({
    //   exclude: ['test/**/*', 'node_modules/**/*']
    // })
  ],
  // external: external,
  targets: [
    {
      dest: pkg['main'],
      format: 'umd',
      moduleName: 'vueQueryParser',
      sourceMap: true
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es6',
      sourceMap: true
    }
  ]
};


