'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawrClient = exports.DrawrCanvas = undefined;

var _DrawrCanvas = require('./lib/DrawrCanvas');

var _DrawrCanvas2 = _interopRequireDefault(_DrawrCanvas);

var _DrawrClient = require('./lib/DrawrClient');

var _DrawrClient2 = _interopRequireDefault(_DrawrClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var drawr = {
    DrawrCanvas: _DrawrCanvas2.default,
    DrawrClient: _DrawrClient2.default
};

exports.default = drawr;
exports.DrawrCanvas = _DrawrCanvas2.default;
exports.DrawrClient = _DrawrClient2.default;