/* eslint-disable */
const assert = require('assert')
const path = require('path')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const getPortPromise = require('portfinder').getPortPromise
const PnpWebpackPlugin = require(`pnp-webpack-plugin`)

const defaults = {
  mode: 'development',
  outputPath: path.resolve(__dirname, './dist'),
  target: 'web',
  port: 8080,
  htmlTemplate: path.resolve(__dirname, './public/index.html'),
  entry: path.resolve(__dirname, './src/main.ts'),
}

const getMode = (env, argv) => {
  let mode = null

  const prodTags = ['prod', 'production']
  // const devTags = ['dev', 'develop', 'development']

  if (argv.mode && prodTags.includes(argv.mode)) {
    mode = 'production'
  } else if (env.BUILD_MODE && prodTags.includes(env.BUILD_MODE)) {
    mode = 'production'
  } else if (env.NODE_ENV && prodTags.includes(env.NODE_ENV)) {
    mode = 'production'
  } else {
    mode = defaults.mode
  }

  return mode
}

const getTarget = (env, argv) => argv.target || defaults.target

const getEntryPath = (env, argv) => {
  const entry = argv.entry || argv._[0]
  assert(entry, 'Please provide webpack entry')
  return path.resolve(__dirname, entry)
}

const getOutputPath = (env, argv) =>
  argv.output ? path.resolve(__dirname, argv.output) : defaults.outputPath

module.exports = async (env = {}, argv = {}) => {
  const mode = getMode(env, argv)
  const target = getTarget(env, argv)
  const outputPath = getOutputPath(env, argv)
  const entryPath = getEntryPath(env, argv)
  const port = await getPortPromise({ port: defaults.port })

  const isDev = mode === 'development'
  const isServer = !!process.env.WEBPACK_DEV_SERVER

  console.log(
    `\n\nwebpack mode: ${mode}\ncompiling: ${entryPath}${
      isServer ? `\nport:${port}` : ''
    }\n\n`
  )

  return {
    mode,
    target,
    devtool: isDev ? 'inline-source-map' : false,
    entry: entryPath,
    resolve: {
      plugins: [PnpWebpackPlugin],
      extensions: ['.js', '.vue', '.ts'],
      alias: {
        vue: isDev ? 'vue/dist/vue.runtime.js' : 'vue/dist/vue.runtime.min.js',
      },
    },
    resolveLoader: {
      plugins: [PnpWebpackPlugin.moduleLoader(module)],
    },
    optimization: {
      removeAvailableModules: true,
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          // sourceMap: true,

          terserOptions: {
            parse: {
              ecma: 2020,
            },
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            compress: {
              pure_funcs: [
                'console.info',
                'console.debug',
                'console.warn',
                'console.log',
              ],
            },

            output: {
              comments: false,
            },
            // warnings: true,
            module: true,
            toplevel: true,
            // ecma: 2015,

            mangle: true, // default value?
            // ie8: false, // default value
            // ecma: 5 // default value
          },
        }),
        new OptimizeCssAssetsPlugin({
          cssProcessorPluginOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
        }),
      ],

      moduleIds: 'hashed',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // carefull with using this as it might actually increase bundle size
          // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-2
          // https://webpack.js.org/guides/caching/
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
        // maxSize: 51200,
        // actually is seems to increase load time
        // https://developers.google.com/web/tools/chrome-devtools/network/issues
        // maxInitialRequests: Infinity,
        // chunks: 'all',
      },
    },
    module: {
      rules: [
        // ...(isDev
        //   ? []
        //   : [
        //       {
        //         enforce: 'pre',
        //         test: /\.(js|vue)$/,
        //         loader: 'eslint-loader',
        //         exclude: /node_modules/,
        //       },
        //     ]),
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            // {
            // loader: 'babel-loader',
            // options: {
            //   presets: ['@babel/preset-env'],
            //   plugins: ['@babel/plugin-proposal-do-expressions'],
            // },
            // },
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: [/\.vue$/],
              },
            },
          ],
        },
        {
          // test: /\.(woff(2)?|png|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          test: /\.(woff(2)?|png|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'static/',
                // publicPath: path.relative(outputPath, '/static'),
              },
            },
          ],
        },
        {
          test: /\.s(c|a)ss$/,
          use: [
            isDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              // options: {
              //   sourceMap: true,
              // },
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sassOptions: {
                  fiber: require('fibers'),
                  indentedSyntax: true, // optional
                },
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            isDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                // modules: {
                //   localIdentName: '[hash:base64:8]',
                // getLocalIdent: oneLetterCss.getLocalIdent,
                // },
              },
            },
            'less-loader',
          ],
        },
        {
          test: /\.styl(us)?$/,
          use: [
            isDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: {
                  localIdentName: '[hash:base64:8]',
                  // getLocalIdent: oneLetterCss.getLocalIdent,
                },
              },
            },
            'stylus-loader',
          ],
        },
        {
          test: /\.css$/,
          use: [
            isDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              // options: {
              //   sourceMap: true,
              //   modules: {
              //     localIdentName: '[hash:base64:8]',
              //     // getLocalIdent: oneLetterCss.getLocalIdent,
              //   },
              // },
            },
          ],
        },
      ],
    },
    devServer: {
      contentBase: outputPath,
      compress: true,
      // host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      index: entryPath,
      open: false,
      overlay: true,
      port,
      stats: {
        normal: true,
      },
    },
    performance: {
      hints: false,
    },
    plugins: [
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      new VuetifyLoaderPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      }),
      new webpack.ProvidePlugin({
        assert: 'assert',
      }),
      new HtmlWebpackPlugin({
        // favicon: 'public/favicon.ico',
        template: defaults.htmlTemplate,
      }),
      //@ts-ignore // seems like typing for this plugin are outdated
      // new WorkerPlugin({ sharedWorker: true, worker: false }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        // filename: 'style/[name].[/*  */contenthash].css',
        esModule: true,
        filename: 'style/[name].[hash].css',
        chunkFilename: 'style/[id].[hash].css',
        ignoreOrder: false, // Enable to remove warnings about conflicting order
      }),
      // ...(isServer ? [] : [new WebpackBundleAnalyzer()]),
    ],
    output: {
      // filename: 'js/[name].[contenthash].js',
      // globalObject: 'self',
      filename: 'js/[name].[hash].js',
      publicPath: '/',
      chunkFilename: 'js/[id].[hash].bundle.js',
      path: outputPath,
      libraryTarget: 'umd',
    },
  }
}
