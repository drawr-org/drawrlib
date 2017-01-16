'use strict';

// let W3CWebSocket = require('websocket').w3cwebsocket;
let EventEmitter = require('eventemitter3');

/**
 * error handling if websocket fails to connect
 * @private
 * @returns {void}
 */
function onWebSocketError() {
    console.log('error connecting to ws server');
}

/**
 * emit event when websocket connection is open
 * @private
 * @returns {void}
 */
function onWebSocketOpen() {
    console.log('connected to server');
    if (this._wsClient.readyState === this._wsClient.OPEN) {
        this._eventEmitter.emit('connected');
    }
}

/**
 * handle wedsocket messages from server
 * @private
 * @param {Object} event - websocket event data
 * @returns {void}
 */
function onWebSocketMessage(event) {
    let msg = JSON.parse(event.data);
    if (msg.type === 'ack-session') {
        if (msg.status === 'new-session-success') {
            this._initSession(msg.data);
        } else if (msg.status === 'join-session-success') {
            this._initSession(msg.data);
        }
    } else if (msg.type === 'newPeer') {
        this._eventEmitter.emit('newPeer', msg);
    } else if (msg.type === 'update-canvas') {
        this._eventEmitter.emit('update-canvas', msg.data);
    }
}

/**
 * @typedef {Object} User
 * @property {String} name
 */

/**
 * creates a new server connection
 * @constructor
 * @param {User} user - user to connect to server
 * @param {String} serverUrl - websocket server url
 */
let ServerConnection = function(user, serverUrl) {
    this._user = user;
    this._eventEmitter = new EventEmitter();
    // this._wsClient = new W3CWebSocket();
    // this._wsClient.connect('ws://rmbp.lan:8080/ws');
    this._wsClient = new WebSocket(serverUrl);
    this._wsClient.onopen = onWebSocketOpen.bind(this);
    this._wsClient.onmessage = onWebSocketMessage.bind(this);
    this._wsClient.onerror = onWebSocketError.bind(this);
    this._session = {};
};

/* Private methods */

/**
 * @typedef {Object} SessionData
 * @property {String} sessionId
 * @property {Array} users
 */

/**
 * set session data
 * @private
 * @param {SessionData} sessionData - object with session information
 * @returns {void}
 */
ServerConnection.prototype._initSession = function(sessionData) {
    this._session.id = sessionData.sessionId;
    // this._session.users = sessionData.users;
    if (this._session.clientCallback) {
        this._session.clientCallback(sessionData);
    }
};

/* Public API */

/**
 * add listener to server event
 * @param {String} name - event name
 * @param {Function} listener - function to be executed on event
 * @param {Context} context - context (this value) to execute listener
 * @returns {void}
 */
ServerConnection.prototype.addEventListener = function(name, listener, context) {
    if (typeof name !== 'string') {
        throw new Error('event name must be a string');
    }
    if (typeof listener !== 'function') {
        throw new Error('listener must be a function');
    }
    this._eventEmitter.on(name, listener, context);
};

/**
 * join an existing session via session id
 * @param {String} sessionId - id of the session to join
 * @param {Function} callback - called after server returns answer
 * @returns {void}
 */
ServerConnection.prototype.joinSession = function(sessionId, callback) {
    if (callback) {
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        } else {
            this._session.clientCallback = callback;
        }
    }
    this._wsClient.send(
        JSON.stringify({
            type: 'join-session',
            data: {
                username: this.user.name,
                sessionId: sessionId
            }
        })
    );
};

/**
 * creates a new session with given name
 * @param {String} name - session name
 * @param {Function} callback - called after server returns answer
 * @returns {void}
 */
ServerConnection.prototype.newSession = function(name, callback) {
    if (callback) {
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        } else {
            this._session.clientCallback = callback;
        }
    }
    this._wsClient.send(
        JSON.stringify({
            type: 'new-session',
            data: {
                username: this._user.name,
                sessionName: name
            }
        })
    );
};

/**
 * get session ID from connected session
 * @returns {Number} sessionId
 */
ServerConnection.prototype.getSessionId = function() {
    return this._session.id;
};

ServerConnection.prototype.sendCanvasUpdate = function(clicks) {
    this._wsClient.send(
        JSON.stringify({
            type: 'update-canvas',
            data: {
                username: this._user.name,
                sessionId: '',
                canvasState: JSON.stringify(clicks)
            }
        })
    );
};

module.exports = ServerConnection;
