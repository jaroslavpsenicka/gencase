const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { env } = process;

const options = {
  mode: env.NODE_ENV,
  entry: './client/index.js',
  output: {
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader']},
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV) }),
    new HtmlWebpackPlugin()
  ],
  devServer: {
    hot: true
  },
  devtool: env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : undefined
};

module.exports = options;
