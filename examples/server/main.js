'use strict';
/* global Drawr */

let server;
server = new Drawr.ServerConnection({
    name: 'competitive lumberjack',
}, {
    host: 'etsag.de',
    port: '8881'
});

server.addEventListener('update-canvas', function(data) {
    if (server._user.name !== data.username) {
        canvas.remoteUpdate(JSON.parse(data.canvasState));
    }
});

let canvas = new Drawr.DrawingCanvas('canvasDiv');
canvas.addEventListener('new-click', function(clicks) {
    server.sendCanvasUpdate(clicks);
});

server.newSession('fun session').then(success => {
    console.log(success);
}).catch(err => {
    console.log(err);
});
