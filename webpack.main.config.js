module.exports = {
  mode: "production",
  entry: "./app/main/index.ts",
  target: "electron-main",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "main.prod.js",
    path: require("path").resolve(__dirname, "app/main/dist"),
  },
};
