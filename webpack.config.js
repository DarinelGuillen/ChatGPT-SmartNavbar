// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Modo de compilación: 'development' para desarrollo, 'production' para producción
  mode: 'development', // Cambia a 'production' cuando estés listo para desplegar

  // Definición de puntos de entrada
  entry: {
    contentScript: './src/js/contentScript.js', // Punto de entrada existente
    popup: './src/js/popup.js', // Nuevo punto de entrada para el popup
  },

  // Configuración de salida
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js', // Genera 'contentScript.bundle.js' y 'popup.bundle.js'
  },

  // Configuración de módulos y reglas
  module: {
    rules: [
      {
        test: /\.js$/, // Maneja archivos JavaScript
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Transpila ES6+ a ES5
          },
        },
      },
      {
        test: /\.css$/, // Maneja archivos CSS
        use: [
          MiniCssExtractPlugin.loader, // Extrae CSS en archivos separados
          'css-loader', // Interpreta @import y url() como importaciones de ES6
          'postcss-loader', // Procesa CSS con PostCSS (por ejemplo, Tailwind)
        ],
      },
      {
        test: /\.html$/, // Maneja archivos HTML
        use: ['html-loader'], // Necesario para procesar 'popup.html'
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Maneja imágenes
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]', // Guarda imágenes en 'dist/images/'
        },
      },
      // Puedes agregar más reglas según tus necesidades (fuentes, videos, etc.)
    ],
  },

  // Configuración de plugins
  plugins: [
    // Plugin para extraer CSS en archivos separados
    new MiniCssExtractPlugin({
      filename: 'css/styles.css', // Archivo de estilos principal
    }),

    // Plugin para manejar popup.html y la inclusión automática de scripts
    new HtmlWebpackPlugin({
      template: './src/popup.html', // Plantilla HTML de origen
      filename: 'popup.html', // Nombre del archivo generado en 'dist/'
      chunks: ['popup'], // Incluye solo el bundle 'popup.bundle.js'
      inject: 'body', // Inyecta los scripts al final del body
    }),

    // Plugin para copiar archivos estáticos al directorio 'dist/'
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'manifest.json'), // Copia manifest.json
          to: path.resolve(__dirname, 'dist', 'manifest.json'),
        },
        {
          from: path.resolve(__dirname, 'src', 'icons'), // Copia carpeta de iconos
          to: path.resolve(__dirname, 'dist', 'icons'),
        },
        {
          from: path.resolve(__dirname, 'src', 'data'), // Copia carpeta de datos
          to: path.resolve(__dirname, 'dist', 'data'),
        },
        {
          from: path.resolve(__dirname, 'src', 'css'), // Copia carpeta de CSS (si es necesario)
          to: path.resolve(__dirname, 'dist', 'css'),
        },
        // Agrega más patrones si tienes otros recursos estáticos
      ],
    }),
  ],

  // Configuración de generación de mapas de origen para depuración
  devtool: 'source-map',

  // Configuración de resolución de módulos
  resolve: {
    extensions: ['.js', '.json'], // Extensiones que Webpack resolverá
  },

  // Configuración del modo de observación
  watch: true, // Mantiene Webpack en modo watch
};
