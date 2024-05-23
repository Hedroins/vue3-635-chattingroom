const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const  MiniCssExtractPlugin  = require("mini-css-extract-plugin");
const webpack = require("webpack");
const webpackMkcert = require('webpack-mkcert')
const fs = require('fs')


const https = (async ()=>await webpackMkcert.default({
    source: 'coding',
    hosts: ['jydeng.dev', '127.0.0.1']
  }))()

let config = {
    mode: process.env.ENV_TYPE==='dev'?'development':'production',
    entry: './main.js',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true,
        chunkFilename: '[name].chunk.js',
    },
    resolve: {
        alias: {
            '@':path.resolve(__dirname, 'src'),
            '~':path.resolve(__dirname, 'public')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.html'
        }),
        new VueLoaderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            linkType: 'text/css'
        }),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(false),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
          })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader,'css-loader']
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader,'css-loader', 'less-loader']
            },
            {
                test:/\.(png|jpe?g|gif|webp|svg)/,
                type:'asset',
            }
        ]
    },
    performance: {
        hints: 'error', 
        maxAssetSize: 90000000, // 整数类型（以字节为单位）
        maxEntrypointSize: 90000000 // 整数类型（以字节为单位）
      },
      optimization: {
        splitChunks: {
            chunks: 'all',
            //默认值，可以不写
            minSize: 30 * 1024,//分割的 chunk 最小为30kb (文件小于30kb就不分割)
            minChunks: 1,//被提取的 chunk 最少被引用以1次
            maxAsyncRequests: 5,//按需加载时，并行加载的文件的最大数量
            maxInitialRequests: 3,//入口js文件，最大并行请求数量
            automaticNameDelimiter: '~',//命名连接符
            //分割 chunk 的组
            cacheGroups: {
                //node_modules 文件会被打包到 vendors 组的 chunk 中。 --> vendors~xxx.js
                //满足上面的公共规则, 如: 大小超过30kb,至少被引用一次。
                vendors: {
                    name:'vendors',
                    test: /[\\/]node_modules[\\/]/,
                    // 打包的优先级
                    priority: -10
                },
                default: {
                    //要提取的chunk至少被引用两次
                    minChunks: 2,
                    //打包的优先级
                    priority: -20,
                    //如果当前被打包的模块，和之前已经被提取的模块是同一个，就会复用，而不是重新打包
                    reuseExistingChunk: true,
                }

            }

        }
    },
    devServer: {
        static: {
            publicPath: path.resolve(__dirname, './'),
        },
        open: true,
        hot: true,
        https:{
            host: '0.0.0.0',
            port: 443,
            key: fs.readFileSync(path.resolve(__dirname, "./ca/dev.key")),
            cert: fs.readFileSync(path.resolve(__dirname, "./ca/dev.pem")),
        },
      
        proxy:[{
                context:['/api',
                '/api/registry',
                '/api/checkuser',
                '/api/login',
                '/api/updateUserInfo',
                '/api/searchFriends',
                'api/addFriend',
                '/api/getFriends',
                '/api/logout',
                '/api/resetUserState',
                '/api/createRoom',
                '/api/getRoomList',
                 '/api/getMemberList'],
                target: 'http://localhost:5028',
                changeOrigin: true,
                onProxyReq:function (proxyReq, req, res, options) {
                    if (req.body) {
                      let bodyData = JSON.stringify(req.body);
                      // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
                      proxyReq.setHeader('Content-Type','application/json');
                      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                      // stream the content
                      proxyReq.write(bodyData);
                    }
                }
            },{
                context:['/*.png','/*.mp3'],
                target:'http://localhost:5028',
                changeOrigin: true,
            }],
        compress: true
    },
    // devtool:process.env.ENV_TYPE==='development'?'source-map':false
    devtool:'source-map'
}


module.exports = config