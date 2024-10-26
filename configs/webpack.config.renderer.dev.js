/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

const webpack = require("webpack");
const merge = require("webpack-merge");
const { spawn } = require("child_process");
const baseConfig = require("./webpack.config.base.js");
const CheckNodeEnv = require("../internals/scripts/CheckNodeEnv.js");

CheckNodeEnv("development");

const port = 1212;
const publicPath = `http://localhost:${port}/renderer/dist`;

module.exports = merge.smart(baseConfig, {
  devtool: "inline-source-map",

  mode: "development",

  target: "web",

  entry: ["react-hot-loader/patch", "./app/renderer/index"],

  output: {
    publicPath: `${publicPath}/`,
    filename: "renderer.dev.js",
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
              sourceMap: true,
            },
          },
        ],
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/octet-stream",
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: "file-loader",
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "image/svg+xml",
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader",
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new webpack.DefinePlugin({
      // https://github.com/palantir/blueprint/issues/3739.
      "process.env.BLUEPRINT_NAMESPACE": JSON.stringify("bp5"),
      "process.env.REACT_APP_BLUEPRINT_NAMESPACE": JSON.stringify("bp5"),
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    static: {
      publicPath,
    },
    client: {
      logging: "warn",
    },
    devMiddleware: {
      stats: "errors-only",
    },
    headers: { "Access-Control-Allow-Origin": "*" },
    onBeforeSetupMiddleware: () => {
      if (process.env.START_HOT) {
        spawn("npm", ["run", "start-main-dev"], {
          shell: true,
          env: process.env,
          stdio: "inherit",
        })
          .on("close", (code) => process.exit(code))
          .on("error", (spawnError) => console.error(spawnError));
      }
    },
  },
});
