let path = require('path');
let webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'dist/drawr-core.min.js',
        library: 'Drawr'
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
}
