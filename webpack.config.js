const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");

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
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
            {
                test:/\.(png|jpe?g|gif|webp|svg)/,
                type:'asset',
            }
        ]
    },
    devServer: {
        static: {
            publicPath: path.resolve(__dirname, './')
        },
        host: 'localhost',
        open: true,
        hot: true,
        port: '5027',
        proxy:[{
                context:['/api','/api/registry','/api/checkuser','/api/login','/api/updateUserInfo','/api/searchFriends'],
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