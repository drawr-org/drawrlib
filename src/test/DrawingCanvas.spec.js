describe('DrawingCanvas', function() {
    let Drawr = require('./../index.js');
    let DrawingCanvas = Drawr.DrawingCanvas;
    let canvas;

    beforeEach(function() {
        let body = document.getElementsByTagName('body')[0];
        let div = document.createElement('div');
        div.setAttribute('id', 'myCanvasId');
        body.appendChild(div);
        canvas = new DrawingCanvas('myCanvasId');
    });

    it('should create new canvas', function() {
        expect(canvas).to.be.an.instanceOf(DrawingCanvas);
    });

    it('should update width', function() {
        canvas.updateOptions({
            width: 'normal'
        });
        expect(canvas.stylingOptions.width).to.be.equal('normal');
    });

    it('should change zoom', function() {
        canvas.changeZoom(1);
        // new scale should be set
        expect(canvas.scaleX).to.be.equal(0.9);
        expect(canvas.scaleY).to.be.equal(0.9);
    });
});
