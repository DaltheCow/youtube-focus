const { resolve } = require('path');

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: resolve('./public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  }
};
