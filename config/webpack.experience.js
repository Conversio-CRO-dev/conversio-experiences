const path = require('path');

// One bundle per variation: dist/<CODE>/<variation>/main.js, so variations do not overwrite each other.
// An older single-folder experience has no variation and writes dist/<CODE>/main.js.
module.exports = (experienceName, variation) => ({
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: variation
      ? path.resolve(__dirname, '../dist', experienceName, variation)
      : path.resolve(__dirname, '../dist', experienceName),
    filename: 'main.js',
    iife: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@conversio/helpers': path.resolve(__dirname, '../packages/helpers/src'),
    },
  },
});
