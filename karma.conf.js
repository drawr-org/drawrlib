// Karma configuration
// Generated on Sat Nov 19 2016 00:50:37 GMT+0100 (CET)

/* eslint-env node */

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const UNIT_TESTS = 'src/test/*spec.js';
const SOURCE_FILES = 'src/lib/*.js';

let files = [];
let preprocessors = {};
if (argv.examples) {
    // export library for examples
    let webpack = require('webpack');
    // returns a Compiler instance
    let compiler = webpack(require('./webpack.config.js'));
    compiler.watch({ // watch options:
        aggregateTimeout: 300, // wait so long for more changes
        poll: true // use polling instead of native watchers
    }, (err, stats) => {
        if (err) {
            throw err;
        }
        if (stats.hasErrors()) {
            console.log('webpack threw errors compiling!');
            console.log(stats.toJson('errors-only'));
        }
    });
    files.push(
        {pattern: 'examples/**/*', watched: false, included: false},
        {pattern: 'dist/*', watched: false, included: false, nocache: true}
    );
} else if (argv.test) {
    files.push(UNIT_TESTS);
    preprocessors[UNIT_TESTS] = ['webpack'];
    preprocessors[SOURCE_FILES] = ['coverage'];
} else {
    console.log('please use --examples or --test option!');
    process.exit(1);
}

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai'],


        // list of files / patterns to load in the browser
        files: files,


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: preprocessors,

        webpack: {
            module: {
                preLoaders: [
                    // instrument only testing sources with Istanbul
                    {
                        test: /\.js$/,
                        include: path.resolve('src/lib/'),
                        loader: 'istanbul-instrumenter'
                    }
                ]
            }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
