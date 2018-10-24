const { resolve } = require('path');

module.exports = {
  entry: {
    popup: './popup/index.jsx',
    options: './options/index.jsx',
    not_available: './not_available/index.jsx',
    background: './background/index.js'
  },
  output: {
    path: resolve('./public'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
  devtool: 'source-map',
};
