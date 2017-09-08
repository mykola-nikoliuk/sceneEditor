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
      test: /\.(mtl|obj|jpg|png)$/,
      loader: 'file-loader?name=[path][name].[ext]?[hash]&context=./src'
    }]
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new HtmlWebpackPlugin({
      title: 'test'
    }),
    new CopyWebpackPlugin([
      {from: './resources/**/*.jpg', context: './src'},
      {from: './resources/**/*.png', context: './src'},
      {from: './resources/**/*.tga', context: './src'}
    ])
  ]
};