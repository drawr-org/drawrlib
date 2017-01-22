# Contributing guide

## Overview

This guide should give a developer all information to start contributing to the codebase

## Technical Information

### JS ES6

* all latest features from [es6](https://html5hive.org/es6-and-babel-tutorial/) are allowed to use, and we compile our library with [BabelJS](https://babeljs.io/)

### Server Communication

* we use [xhr](https://www.npmjs.com/package/xhr) library to make our http requests
* we are using the default implementation of [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## Package npm scripts

* `npm run build-publish` - exports babel compiled code to `publish` folder (enable `import drawr from 'drawr'`)
* `npm run commit-test` - check code style and syntax, runs unit tests and builds library
* `npm run export` - exports library to `dist/drawr.js` and `dist/drawr.min.js`
* `npm start`
    * `--examples` - starts examples server on `/example/**/index.html`
    * `--test` - starts unit tests server
* `npm test` - runs unit tests
