'use strict';

let W3CWebSocket = require('websocket').w3cwebsocket;
let EventEmitter = require('eventemitter3');

function onWebSocketOpen() {
    console.log('connected to server');
    this.wsClient.send(
        JSON.stringify({type: 'hello world', data: 'it\'s me'})
    );
}

function onWebSocketMessage(event) {
    let msg = JSON.parse(event.data);
    if (msg.type === 'newSession') {
        //
    } else if (msg.type === 'joinSession') {
        this.eventEmitter.emit('joinSession', msg);
    } else if (msg.type === 'newPeer') {
        this.eventEmitter.emit('newPeer', msg);
    }
}

let ServerConnection = function() {
    this.eventEmitter = new EventEmitter();
    this.wsClient = new W3CWebSocket();
    this.wsClient.onopen = onWebSocketOpen.bind(this);
    this.wsClient.onmessage = onWebSocketMessage.bind(this);
    this.wsClient.onerror = this.onWebSocketError;
    // client.connect('ws://golang-server');
};

ServerConnection.prototype.onWebSocketError = function() {
    console.log('error connecting to server');
};
