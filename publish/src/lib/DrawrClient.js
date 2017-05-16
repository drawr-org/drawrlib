'use strict';

/* msg schema
    Message {
        status,
        type,
        data
    }
*/

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

require('whatwg-fetch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * error handling if websocket fails to connect
 * @private
 * @param {Object} event - websocket envent data
 * @returns {void}
 */
function onWebSocketError(event) {
    console.log('error connecting to ws server');
    this._eventEmitter.emit('websocket-error', event.reason);
}

/**
 * emit event when websocket connection is open
 * @private
 * @param {Object} event - websocket envent data
 * @returns {void}
 */
function onWebSocketOpen(event) {
    console.log('connected to websocket server');
    this._eventEmitter.emit('websocket-open', event.reason);
}

/**
 * emit event when websocket connection is closed by the server
 * @private
 * @param {Object} event - websocket envent data
 * @returns {void}
 */
function onWebSocketClose(event) {
    console.log('websocket server sent close:', event.reason);
    this._wsClient.close(1000, 'client closed');
    // TODO: clean up
}

/**
 * handle wedsocket messages from server
 * @private
 * @param {Object} event - websocket event data
 * @returns {void}
 */
function onWebSocketMessage(event) {
    var msg = JSON.parse(event.data);
    if (msg.type === 'new-user') {
        this._eventEmitter.emit('new-user', msg.data);
    } else if (msg.type === 'update-canvas') {
        this._eventEmitter.emit('update-canvas', msg.data);
    } else if (msg.type === 'server-down') {
        this._eventEmitter.emit('server-down', msg.data);
    }
}

/**
 * util function to generate url
 * @private
 * @param {String} protocol - http or ws
 * @param {String} endPoint - which endpoint to request
 * @returns {String} url - concatenated url
 */
function makeUrl(protocol, endPoint) {
    return protocol + '://' + this._options.host + ':' + this._options.port + endPoint;
}

/**
 * Class to comunicate with the drawr backend
 */

var DrawrClient = function () {
    /**
    * @typedef {Object} User
    * @property {String} name
    */

    /**
    * creates a new server connection instance
    * @param {User} user - user to connect to server
    * @param {Object} options - websocket/http server host and port
    */
    function DrawrClient(user, options) {
        _classCallCheck(this, DrawrClient);

        this._user = user;
        this._options = options;
        this._eventEmitter = new _eventemitter2.default();
        this._wsClient = null;
        this._pendingUpdates = [];
        this._session = {};
    }
    /* Private methods */

    /**
    * @typedef {Object} SessionData
    * @property {String} sessionId
    * @property {Array} users
    */

    /**
    * set session data
    * @private
    * @returns {Promise} p - successfull if websocket connects
    */


    _createClass(DrawrClient, [{
        key: '_connectToSession',
        value: function _connectToSession() {
            var _this = this;

            var p = new Promise(function (resolve, reject) {
                try {
                    _this._wsClient = new WebSocket(makeUrl.call(_this, 'ws', '/session/' + _this._session.id + '/ws'));
                    _this._wsClient.onopen = onWebSocketOpen.bind(_this);
                    _this._wsClient.onmessage = onWebSocketMessage.bind(_this);
                    _this._wsClient.onerror = onWebSocketError.bind(_this);
                    _this._wsClient.onclose = onWebSocketClose.bind(_this);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
            return p;
        }

        /* Public API */

        /**
        * add listener to server event
        * @param {String} name - event name
        * @param {Function} listener - function to be executed on event
        * @param {Context} context - context (this value) to execute listener
        * @returns {void}
        */

    }, {
        key: 'addEventListener',
        value: function addEventListener(name, listener, context) {
            if (typeof name !== 'string') {
                throw new TypeError('event name must be a string');
            }
            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }
            this._eventEmitter.on(name, listener, context);
        }

        /**
        * join an existing session via session id
        * @param {String} sessionId - id of the session to join
        * @returns {Promise} p - resolve/rejects after http request result
        */

    }, {
        key: 'joinSession',
        value: function joinSession(sessionId) {
            var _this2 = this;

            var url = makeUrl.call(this, 'http', '/session/' + sessionId);
            // let options = {};
            var p = new Promise(function (resolve, reject) {
                fetch(url).then(function (response) {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        reject(response);
                    }
                }).then(function (body) {
                    _this2._session = body;
                    _this2._connectToSession().then(resolve).catch(reject);
                }).catch(reject);
            });
            return p;
        }

        /**
        * creates a new session with given name
        * @param {String} name - session name
        * @returns {Promise} p - resolve/rejects after http request result
        */

    }, {
        key: 'newSession',
        value: function newSession() {
            var _this3 = this;

            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            var url = makeUrl.call(this, 'http', '/session/new?name=' + name);
            // let options = {};
            var p = new Promise(function (resolve, reject) {
                fetch(url).then(function (response) {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        reject(response);
                    }
                }).then(function (body) {
                    _this3._session = body;
                    _this3._connectToSession().then(resolve(_this3.getSessionId())).catch(reject);
                }).catch(reject);
            });
            return p;
        }

        /**
        * get session ID from connected session
        * @returns {String} sessionId
        */

    }, {
        key: 'getSessionId',
        value: function getSessionId() {
            return this._session.id;
        }

        /**
        * get connected users from session
        * @returns {Array} usersList - array with all users connected to session
        */

    }, {
        key: 'getUsersList',
        value: function getUsersList() {
            return this._session.users;
        }

        /**
        * send canvas click updates to websocket connection
        * @param {Array} clicks - new clicks to send
        * @returns {void}
        */

    }, {
        key: 'sendCanvasUpdate',
        value: function sendCanvasUpdate(clicks) {
            if (this._wsClient && this._wsClient.readyState === this._wsClient.OPEN) {
                if (this._pendingUpdates.length > 0) {
                    var combinedClicks = this._pendingUpdates.pop().concat(clicks);
                    this._wsClient.send(JSON.stringify({
                        type: 'update-canvas',
                        data: {
                            username: this._user.name,
                            sessionId: '',
                            canvasState: JSON.stringify(combinedClicks)
                        }
                    }));
                } else {
                    this._wsClient.send(JSON.stringify({
                        type: 'update-canvas',
                        data: {
                            username: this._user.name,
                            sessionId: '',
                            canvasState: JSON.stringify(clicks)
                        }
                    }));
                }
            } else {
                this._pendingUpdates.unshift(clicks);
            }
        }
    }]);

    return DrawrClient;
}();

exports.default = DrawrClient;