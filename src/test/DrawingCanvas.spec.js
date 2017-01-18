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
        expect(canvas._stylingOptions.width).to.be.equal('normal');
    });

    it('should throw error with wrong zoom', function() {
        expect(canvas.setZoom.bind(canvas, -1)).to.throw(
            Error, 'zoom must be an integer equal or bigger than zero'
        );
    });

    it('should change zoom', function() {
        canvas.setZoom(1);
        // new scale should be set
        expect(canvas._scaleX).to.be.equal(0.9);
        expect(canvas._scaleY).to.be.equal(0.9);
    });

    it('should return index of local click', function() {
        // array used: [localClick, remoteClick, localClick]
        // add local click
        canvas._addClick(100, 100, false);
        canvas.remoteUpdate({
            x: 200,
            y: 200,
            drag: false,
            style: canvas._stylingOptions,
            remote: true
        });
        // add another local click
        canvas._addClick(150, 150, false);
        expect(canvas._getLastLocalClick(1)).to.be.equal(0);
    });

    it('should throw error with empty event string', function() {
        expect(canvas.addEventListener.bind(canvas, {})).to.throw(
            Error, 'event name must be a string'
        );
    });

    it('should throw error when listener is not a function', function() {
        expect(canvas.addEventListener.bind(canvas, 'test', {})).to.throw(
            Error, 'listener must be a function'
        );
    });

    it('should add event listener', function(done) {
        let Context = function() {
            this.prop = 'test';
        };
        let context = new Context();
        canvas.addEventListener('test', function() {
            // check if context (this value) was passed as well
            expect(this.prop).to.be.equal('test');
            done();
        }, context);
        canvas._eventEmitter.emit('test');
    });

    it('should change color to white with eraser', function() {
        canvas.updateOptions({
            type: DrawingCanvas.drawingTools.ERASER
        });
        expect(canvas._stylingOptions.colour).to.be.equal('#FFFFFF');
    });

    it('should clear canvas', function() {
        canvas._addClick(100, 100, false);
        canvas.clearCanvas();
        expect(canvas._clicks).to.have.lengthOf(0);
    });
});
