/**
 * Base webpack config used across other specific configs
 */

const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2019",
        },
      },
    ],
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),

    new ForkTsCheckerWebpackPlugin(),
  ],
};
