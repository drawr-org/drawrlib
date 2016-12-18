'use strict';

let myCanvas = new Drawr.DrawingCanvas('canvasDiv');
setTimeout(() => {
    myCanvas.changeZoom(5);
    myCanvas.updateOptions({colour: '#0c386b'});
}, 3000);
