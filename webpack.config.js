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
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
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
        maxAssetSize: 9000000, // 整数类型（以字节为单位）
        maxEntrypointSize: 9000000 // 整数类型（以字节为单位）
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
                '/api/resetUserState'],
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
                context:['/*.png'],
                target:'http://localhost:5028',
                changeOrigin: true,
            }],
        compress: true
    },
    devtool:'source-map'
}


module.exports = config