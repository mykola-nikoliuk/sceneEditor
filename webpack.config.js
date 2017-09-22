const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = (env = {}) => {
  const config = {
    context: path.resolve(__dirname, 'src'),
    entry: {
      main: ['./index.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      loaders: [{
        test: /\.styl/,
        loader: 'style-loader!css-loader!stylus-loader'
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }, {
        test: /\.(mtl|obj|fbx|jpg|png)$/,
        loader: 'file-loader?name=[path][name].[ext]?[hash]&context=./src'
      }, {
        test: /\.json$/,
        loader: 'json-loader'
      }]
    },
    plugins: [
      new WebpackCleanupPlugin(),
      // new webpack.optimize.CommonsChunkPlugin("init"),
      new HtmlWebpackPlugin({
        template: './index.ejs'
        // chunks: ['init']
      }),
      new CopyWebpackPlugin([
        {from: '**/*.FBX'},
        {from: '**/*.tga'},
        {from: '**/*.jpg'},
        {from: '**/*.png'},
        {from: '**/*.tga'}
      ]),
      new webpack.DefinePlugin({
        ENVIRONMENT: JSON.stringify(env.production ? 'production' : 'development')
      })
    ]
  };

  if (env.production) {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: true,
          unsafe: true
        }
      })
    );
  }

  return config;
};