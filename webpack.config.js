const { resolve } = require('path');

module.exports = {
  entry: {
    popup: './popup/index.jsx',
    options: './options/index.jsx'
  },
  output: {
    path: resolve('./public'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  }
};
