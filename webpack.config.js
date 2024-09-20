// webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'development',

  entry: {
    contentScript: './src/js/contentScript.js',
    popup: './src/js/popup.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    clean: true, // Limpia la carpeta de salida antes de cada build
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
          MiniCssExtractPlugin.loader, // Extrae el CSS en archivos separados
          'css-loader', // Interpreta @import y url()
          'postcss-loader', // Procesa el CSS con PostCSS (Tailwind)
        ],
      },
      {
        test: /\.html$/,
        use: ['html-loader'], // Procesa archivos HTML
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource', // Maneja imágenes
        generator: {
          filename: 'images/[name][ext]',
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css', // Genera CSS por cada entry
    }),
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup'], // Inyecta solo los chunks necesarios
      inject: 'head', // Inyecta CSS en el <head>
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
          from: path.resolve(__dirname, 'src', 'css', 'contentScript.css'),
          to: path.resolve(__dirname, 'dist', 'css', 'contentScript.css'),
          transform(content, path) {
            // Procesa contentScript.css con PostCSS (Tailwind + Autoprefixer)
            return postcss([tailwindcss, autoprefixer])
              .process(content.toString(), { from: undefined })
              .then(result => result.css);
          },
        },
      ],
    }),
    new BundleAnalyzerPlugin(), // Opcional: analiza el contenido de los bundles
  ],

  devtool: 'source-map', // Genera mapas de origen para depuración

  resolve: {
    extensions: ['.js', '.json'],
  },

  watch: true, // Habilita el modo watch
};
