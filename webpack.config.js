var CopyWebpackPlugin = require('copy-webpack-plugin')
var LiveReloadPlugin = require('webpack-livereload-plugin')

module.exports = {
  entry: {
    index: ["./index.html", "./index.js"],
    worker: "./worker.js"
  },
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
    path: "./public/",
    filename: "[name].bundle.js"
  },
  plugins: [
    new LiveReloadPlugin(),
    new CopyWebpackPlugin([
      { from: "index.html", to: "public/index.html" }
    ])
  ],
  target: "web",
  watch: true
}
