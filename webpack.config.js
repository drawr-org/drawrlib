/* eslint-env node */
let webpack = require('webpack');

const argv = require('minimist')(process.argv.slice(2));
let filename;
let plugins = [];
if (argv.minified) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
    filename = '[name].min.js';
} else {
    filename = '[name].js';
}

let entry;
if (argv.modular) {
    entry = {
        DrawrCanvas: './src/lib/DrawrCanvas.js',
        DrawrClient: './src/lib/DrawrClient.js'
    };
} else {
    entry = {
        drawr: './src/index.js'
    };
}

module.exports = {
    entry: entry,
    output: {
        filename: `dist/${filename}`,
        library: '[name]'
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    plugins: plugins
};
