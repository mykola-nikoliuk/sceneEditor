const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  entry: {
    main: ['./src/index.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    loaders: [{
      test: /\.styl/,
      loader: 'style-loader!css-loader!stylus-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
      test: /\.(mtl|obj|fbx|jpg|png)$/,
      loader: 'file-loader?name=[path][name].[ext]?[hash]&context=./src'
    }]
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new HtmlWebpackPlugin({
      title: 'test'
    }),
    new CopyWebpackPlugin([
      {from: '**/*.FBX', context: './src'},
      {from: '**/*.tga', context: './src'},
      {from: '**/*.jpg', context: './src'},
      {from: '**/*.png', context: './src'},
      {from: '**/*.tga', context: './src'}
    ])
  ]
};