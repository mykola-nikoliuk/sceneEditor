const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const getPort = require('getport');
const config = require('../webpack.config')();
const port = parseInt(process.argv[2]);
const hotModuleReplacement = new webpack.HotModuleReplacementPlugin();

getPort(port, port + 10, function(e, port) {
  config.entry.main.unshift(`webpack-dev-server/client?http://localhost:${port}/`, 'webpack/hot/dev-server');
  config.plugins.push(hotModuleReplacement);

  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, {
    stats: {
     colors: true
    },
    hot: true,
    // inline: true,
    historyApiFallback: true
  });

  server.listen(port);
});
