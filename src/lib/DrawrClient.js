'use strict';

/* msg schema
    Message {
        status,
        type,
        data
    }
*/

import EventEmitter from 'eventemitter3';
import xhr from 'xhr';

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
    console.log('connected to websocket server');
}

/**
 * handle wedsocket messages from server
 * @private
 * @param {Object} event - websocket event data
 * @returns {void}
 */
function onWebSocketMessage(event) {
    let msg = JSON.parse(event.data);
    if (msg.type === 'new-user') {
        this._eventEmitter.emit('new-user', msg.data);
    } else if (msg.type === 'update-canvas') {
        this._eventEmitter.emit('update-canvas', msg.data);
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
    return `${protocol}://${this._options.host}:${
        this._options.port}${endPoint}`;
}


export default class DrawrClient {
    /**
    * @typedef {Object} User
    * @property {String} name
    */

    /**
    * creates a new server connection instance
    * @constructor
    * @param {User} user - user to connect to server
    * @param {Object} options - websocket/http server host and port
    */
    constructor(user, options) {
        this._user = user;
        this._options = options;
        this._eventEmitter = new EventEmitter();
        this._wsClient = null;
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
    _connectToSession() {
        let p = new Promise((resolve, reject) => {
            try {
                this._wsClient = new WebSocket(makeUrl.call(
                    this, 'ws', `/session/${this._session.id}/ws`
                ));
                this._wsClient.onopen = onWebSocketOpen.bind(this);
                this._wsClient.onmessage = onWebSocketMessage.bind(this);
                this._wsClient.onerror = onWebSocketError.bind(this);
                resolve();
            } catch(e) {
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
    addEventListener(name, listener, context) {
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
    joinSession(sessionId) {
        let options = {
            url: makeUrl.call(this, 'http', `/session/${sessionId}`)
        };
        let p = new Promise((resolve, reject) => {
            xhr(options, (err, response, body) => {
                if (err) {
                    reject(response);
                }
                if (response.statusCode === 200) {
                    this._session = JSON.parse(body);
                    this._connectToSession()
                    .then(resolve)
                    .catch(reject);
                } else {
                    reject(response);
                }
            });
        });
        return p;
    }

    /**
    * creates a new session with given name
    * @param {String} name - session name
    * @returns {Promise} p - resolve/rejects after http request result
    */
    newSession(name = '') {
        let options = {
            url: makeUrl.call(this, 'http', `/session/new?name=${name}`)
        };
        let p = new Promise((resolve, reject) => {
            xhr(options, (err, response, body) => {
                if (err) {
                    reject(response);
                }
                if (response.statusCode === 200) {
                    this._session = JSON.parse(body);
                    this._connectToSession()
                    .then(resolve(this.getSessionId()))
                    .catch(reject);
                } else {
                    reject(response);
                }
            });
        });
        return p;
    }

    /**
    * get session ID from connected session
    * @returns {String} sessionId
    */
    getSessionId() {
        return this._session.id;
    }

    /**
    * get connected users from session
    * @returns {Array} usersList - array with all users connected to session
    */
    getUsersList() {
        return this._session.users;
    }

    /**
    * send canvas click updates to websocket connection
    * @param {Array} clicks - new clicks to send
    * @returns {void}
    */
    sendCanvasUpdate(clicks) {
        if (this._wsClient.readyState === this._wsClient.OPEN) {
            if (this._pendingUpdates.length > 0) {
                let combinedClicks = this._pendingUpdates.pop().concat(clicks);
                this._wsClient.send(
                    JSON.stringify({
                        type: 'update-canvas',
                        data: {
                            username: this._user.name,
                            sessionId: '',
                            canvasState: JSON.stringify(combinedClicks)
                        }
                    })
                );
            } else {
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
            }
        } else {
            this._pendingUpdates.unshift(clicks);
        }
    }
}
