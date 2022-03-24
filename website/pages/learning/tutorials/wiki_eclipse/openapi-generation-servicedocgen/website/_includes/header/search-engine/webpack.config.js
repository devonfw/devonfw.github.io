const path = require("path");
const webpack = require("webpack");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: "./src/render.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/sentiment/index.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/brill_pos_tagger/lib/Lexicon.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/stemmers/indonesian/stemmer_id.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/stemmers/indonesian/prefix_rules.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/normalizers/normalizer_ja.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/stemmers/Carry/index.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/stemmers/porter_stemmer_nl.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/tokenizers/tokenizer_ja.js"
        ),
        use: "null-loader",
      },
      {
        test: path.resolve(
          __dirname,
          "node_modules/natural/lib/natural/transliterators/index.js"
        ),
        use: "null-loader",
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
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    //new BundleAnalyzerPlugin()
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
      "process.type": JSON.stringify(process.type),
      "process.version": JSON.stringify(process.version),
    }),
  ],
  optimization: {
    minimize: false,
  }
};
