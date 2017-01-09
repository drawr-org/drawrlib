'use strict';
/* global Drawr */

let server;
try {
    server = new Drawr.ServerConnection({
        name: 'pedro',
        id: '0'
    }, 'ws://etsag.de:8880/ws');
} catch (e) {
    console.log(e);
}

let canvas = new Drawr.DrawingCanvas('canvasDiv');
server.addEventListener('update-canvas', function(data) {
    if (server._user.name !== data.username) {
        canvas.remoteUpdate(JSON.parse(data.canvasState));
    }
}, canvas);

canvas.addEventListener('new-click', function(clicks) {
    server.sendCanvasUpdate(clicks);
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
