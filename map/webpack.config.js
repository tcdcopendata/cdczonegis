var path = require('path');


var config = {
    entry:  path.join(__dirname, "src/main.js"),
    output: {
        path: path.resolve(__dirname, 'public/javascripts/'),
        filename: "zoneDengue.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.js$/,
                loader: 'ify-loader'
            },
            {
                test: /\.css$/,
                loader: ['style-loader','css-loader']
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*','.js','.vue','.json']
    }
    // modules: {
    //     rules: [
    //         {
    //             test: /\.vue$/,
    //             loader: 'vue-loader',
    //             options: {
    //                 loaders: {
    //                     css: ExtractTextPlugin.extract({
    //                         use: 'css-loader',
    //                         fallback: 'vue-style-loader'
    //                     })
    //                 }
    //             }
    //         },
    //         {
    //             test: /\.js$/,
    //             loader: 'babel-loader',
    //             exclude: /node_modules/
    //         },
    //         {
    //             test: /\.css$/,
    //             use: ExtractTextPlugin.extract({
    //                 use: 'css-loader',
    //                 fallback: 'vue-style-loader'
    //             })
    //         }
    //     ]
    // },
};

module.exports = config;