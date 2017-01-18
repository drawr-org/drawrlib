'use strict';
/* global Drawr */

let server;
server = new Drawr.ServerConnection({
    name: 'pedro',
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

server.newSession().then(success => {
    console.log(success);
}).catch(err => {
    console.log(err);
});

// setTimeout(() => {
//     // simulate remote click
//     // canvas will update at top-left corner
//     server._eventEmitter.emit('update-canvas', {clicks: [
//         {
//             x: 100, y: 100, drag: false, remote: true, style: {
//                 colour: '#000000',
//                 width: 'large',
//                 type: 'pen',
//             }
//         },
//         {
//             x: 200, y: 200, drag: true, remote: true, style: {
//                 colour: '#d2345f',
//                 width: 'large',
//                 type: 'pen',
//             }
//         }
//     ]});
// }, 3000);

// server.addEventListener('connected', () => {
//     server.newSession('competitive lumberjack', (data) => {
//         let canvas = new Drawr.DrawingCanvas('canvasDiv');
//     });
// });
