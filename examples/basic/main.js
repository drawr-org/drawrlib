'use strict';
/* global DrawrCanvas */

let myCanvas = new DrawrCanvas.default('canvasDiv');
setTimeout(() => {
    myCanvas.setZoom(5);
    myCanvas.updateOptions({colour: '#0c386b'});
}, 3000);
