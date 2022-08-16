const path = require('path');
const nodeExternals = require('webpack-node-externals');

const config = {
  mode: 'production',
  entry: {
    server: './src/server'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: false
  },
  target: 'node',
  externals: [nodeExternals()],
  experiments: {
    topLevelAwait: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-top-level-await']
          }
        }
      }
    ]
  }
}

module.exports = (argv) => {
  if (argv.usage == 'cli') {
    config.entry.server = './src/server/index.cli.js';
    config.output.filename = 'server-cli.bundle.js';
  }

  return config;
};