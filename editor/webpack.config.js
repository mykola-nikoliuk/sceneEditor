/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = (env = {}) => {
  const config = {
    context: path.resolve(__dirname, 'editor'),
    entry: {
      main: ['./index.js']
    },
    output: {
      path: path.resolve(__dirname, '..', 'dist', 'editor'),
      filename: '[name].js'
    },
    module: {
      loaders: [{
        test: /\.json$/,
        loader: 'json-loader'
      }]
    },
    node: {
      fs: 'empty',
      net: 'empty'
    },
    plugins: [
      new WebpackCleanupPlugin()
    ]
  };

  return config;
};