const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { env } = process;

const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

const options = {
  mode: env.NODE_ENV,
  entry: './client/index.js',
  output: {
    filename: '[name].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/'
  },
  module: {
    rules: [{ 
      test: /\.css$/i, 
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    }, { 
      test: /\.js$/, 
      loader: 'babel-loader', 
      exclude: /node_modules/
    }, { 
      test: /\.(png|jpg)$/, 
      loader: 'url-loader?limit=8192' 
    }]
  },
  plugins: [
    new LoadablePlugin(),
    new webpack.DefinePlugin(envKeys),
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[name].[hash].css'
    })
  ],
  devServer: {
    hot: true
  },
  devtool: env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : undefined
};

module.exports = options;
