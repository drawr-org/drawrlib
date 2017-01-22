'use strict';
/* global drawr */

let client;
client = new drawr.DrawrClient({
    name: 'competitive lumberjack',
}, {
    host: 'etsag.de',
    port: '8881'
});

client.addEventListener('update-canvas', function(data) {
    if (client._user.name !== data.username) {
        canvas.remoteUpdate(JSON.parse(data.canvasState));
    }
});

let canvas = new drawr.DrawrCanvas('canvasDiv');
canvas.addEventListener('new-click', function(clicks) {
    client.sendCanvasUpdate(clicks);
});

client.newSession('fun session').then(success => {
    console.log(success);
}).catch(err => {
    console.log(err);
});
