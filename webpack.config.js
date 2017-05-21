/* eslint-env node */

module.exports = function(env) {
    let webpack = require('webpack');

    let filename;
    let plugins = [];
    let entry;
    if (env) {
        if (env.minified) {
            plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
            filename = '[name].min.js';
        } else {
            filename = '[name].js';
        }

        if (env.unified) {
            entry = {
                drawr: './src/index.js'
            };
        } else {
            entry = {
                DrawrCanvas: './src/lib/DrawrCanvas.js',
                DrawrClient: './src/lib/DrawrClient.js'
            };
        }
    }
    return {
        entry: entry,
        output: {
            filename: `lib/${filename}`,
            library: '[name]',
            libraryTarget: 'umd'
        },
        module: {
            loaders: [
                {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
                {test: /\.css$/, loaders: ['style-loader', 'css-loader']}
            ]
        },
        plugins: plugins
    };
};
