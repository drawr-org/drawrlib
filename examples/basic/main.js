'use strict';
/* global Drawr */

let myCanvas = new Drawr.DrawingCanvas('canvasDiv');
setTimeout(() => {
    myCanvas.setZoom(5);
    myCanvas.updateOptions({colour: '#0c386b'});
}, 3000);
