var CopyWebpackPlugin = require('copy-webpack-plugin')
var LiveReloadPlugin = require('webpack-livereload-plugin')

module.exports = {
  entry: ["./index.html", "./index.js"],
  module: {
    loaders: [
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loaders: ["raw-loader"]
      }
    ]
  },
  output: {
    filename: "./public/bundle.js",
    chunkFilename: "./public/bundle.js"
  },
  plugins: [
    new LiveReloadPlugin(),
    new CopyWebpackPlugin([
      { from: "index.html", to: "public/index.html" }
    ])
  ],
  target: "web"
}
