const path = require("path");
const webpack = require("webpack");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
  const nodeExternals = require("webpack-node-externals");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");

module.exports = {
  entry: "./src/search-engine.test.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      path: require.resolve("path-browserify"),
      fs: false,
      os: false,
      util: require.resolve("path-browserify"),
      process: require.resolve("path-browserify"),
    },
  },
  output: {
    filename: "testBundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  //target: "node",
  //externals: [nodeExternals()],
  plugins: [
    new WebpackShellPluginNext({
      onBuildExit:
        "mocha " + path.resolve(__dirname, "dist") + "/testBundle.js",
    }),
  ],
  optimization: {
    minimize: false,
  }
};
