const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: {
    contentScript: './src/js/contentScript.js',
    popup: './src/js/popup.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'manifest.json'),
          to: path.resolve(__dirname, 'dist', 'manifest.json'),
        },
        {
          from: path.resolve(__dirname, 'src', 'icons'),
          to: path.resolve(__dirname, 'dist', 'icons'),
        },
        {
          from: path.resolve(__dirname, 'src', 'data'),
          to: path.resolve(__dirname, 'dist', 'data'),
        },
        {
          from: path.resolve(__dirname, 'src', 'css'),
          to: path.resolve(__dirname, 'dist', 'css'),
        },
      ],
    }),
  ],

  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.json'],
  },

  watch: true,
};
