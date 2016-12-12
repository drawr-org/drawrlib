/* eslint-env node */
let webpack = require('webpack');

const argv = require('minimist')(process.argv.slice(2));
let filename;
let plugins = [];
if (argv.minified) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
    filename = 'drawr-core.min.js';
} else {
    filename = 'drawr-core.js';
}

module.exports = {
    entry: './src/index.js',
    output: {
        filename: `dist/${filename}`,
        library: 'Drawr'
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    plugins: plugins
};
