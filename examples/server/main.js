'use strict';
/* global Drawr */

let server = new Drawr.ServerConnection({
    name: 'pedro',
    id: '0'
});

server.eventEmitter.on('connected', () => {
    server.newSession('competitive lumberjack', (data) => {
        console.log(data);
    });
});
