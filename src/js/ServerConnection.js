'use strict';

// let W3CWebSocket = require('websocket').w3cwebsocket;
let EventEmitter = require('eventemitter3');

function onWebSocketOpen() {
    console.log('connected to server');
    if (this.wsClient.readyState === this.wsClient.OPEN) {
        this.eventEmitter.emit('connected');
    }
}

function onWebSocketMessage(event) {
    let msg = JSON.parse(event.data);
    console.log(msg);
    if (msg.type === 'ack-session') {
        if (msg.status === 'new-session-success') {

            this.initSession(msg.data);
        }
    } else if (msg.type === 'newPeer') {
        this.eventEmitter.emit('newPeer', msg);
    }
}

let ServerConnection = function(user) {
    this.user = user;
    this.eventEmitter = new EventEmitter();
    // this.wsClient = new W3CWebSocket();
    this.wsClient = new WebSocket('ws://rmbp.lan:8080/ws');
    this.wsClient.onopen = onWebSocketOpen.bind(this);
    this.wsClient.onmessage = onWebSocketMessage.bind(this);
    this.wsClient.onerror = this.onWebSocketError;
    this.session = {};
    // this.wsClient.connect('ws://rmbp.lan:8080/ws');
};

ServerConnection.prototype.initSession = function(sessionData) {
    this.session.id = sessionData.sessionId;
    // this.session.users = sessionData.users;
    if (this.session.clientCallback) {
        this.session.clientCallback(sessionData);
    }
};

ServerConnection.prototype.onWebSocketError = function() {
    console.log('error connecting to server');
};

ServerConnection.prototype.joinSession = function(sessionId) {
    this.wsClient.send(
        JSON.stringify({
            type: 'join-session',
            data: {
                username: this.user.name,
                sessionId: sessionId
            }
        })
    );
};

ServerConnection.prototype.newSession = function(name, callback) {
    if (callback) {
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        } else {
            this.session.clientCallback = callback;
        }
    }
    this.wsClient.send(
        JSON.stringify({
            type: 'new-session',
            data: {
                username: this.user.name,
                sessionName: name
            }
        })
    );
};

module.exports = ServerConnection;
