'use strict';
/* global Drawr */

let server = new Drawr.ServerConnection({
    name: 'pedro',
    id: '0'
});

let canvas = new Drawr.DrawingCanvas('canvasDiv');
canvas.connectToSession(server);

setTimeout(() => {
    // simulate remote click
    // canvas will update at top-left corner
    server._eventEmitter.emit('update-canvas', {clicks: [
    {
        x: 100, y: 100, drag: false, style: {
            colour: '#000000',
            width: 'large',
            type: 'pen'
        }
    },
    {
        x: 200, y: 200, drag: true, style: {
            colour: '#d2345f',
            width: 'large',
            type: 'pen'
        }
    }]});
}, 3000);

// server.addEventListener('connected', () => {
//     server.newSession('competitive lumberjack', (data) => {
//         let canvas = new Drawr.DrawingCanvas('canvasDiv');
//     });
// });
