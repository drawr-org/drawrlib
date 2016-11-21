describe('DrawingCanvas', function () {
    let DrawingCanvas = require('./../index.js').DrawingCanvas;

    it('should create new canvas', function () {
        let body = document.getElementsByTagName('body')[0];
        let div = document.createElement('div');
        div.setAttribute('id', 'myCanvasId');
        body.appendChild(div);
        let canvas = new DrawingCanvas('myCanvasId');
        expect(canvas).to.be.an.instanceOf(DrawingCanvas);
    });
});
