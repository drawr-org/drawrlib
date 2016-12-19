'use strict';

const STANDARD_OPTIONS = {
    colour: '#000000',
    width: 'large',
    type: 'pen'
};

function mousedownListener(e) {
    let mouseX = e.pageX - this.canvas.offsetLeft;
    let mouseY = e.pageY - this.canvas.offsetTop;

    this.paint = true;
    this.addClick(mouseX, mouseY, false);
    this.redraw();
}

function mousemoveListener(e) {
    let drawingAreaX = this.width;
    let drawingAreaY = this.height;
    let drawingAreaWidth = 10;

    let mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) -
        this.canvas.offsetLeft;
    let mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) -
        this.canvas.offsetTop;
    if (mouseX < drawingAreaX && mouseY < drawingAreaY) {
        if (mouseX > drawingAreaWidth && mouseY > 0) {
            if (this.paint) {
                this.addClick(mouseX, mouseY, true);
                this.redraw();
            }
        } else {
            if (this.paint) {
                this.addClick(mouseX, mouseY, false);
                this.redraw();
            }
        }

    } else {
        if (this.paint) {
            this.addClick(mouseX, mouseY, false);
            this.redraw();
        }
    }
    // Prevent the whole page from dragging if on mobile
    e.preventDefault();
}

function mouseupListener() {
    this.paint = false;
}

function setEventListeners() {
    this.canvas.addEventListener(
        'mousedown', mousedownListener.bind(this), false
    );
    this.canvas.addEventListener(
        'mouseup', mouseupListener.bind(this), false
    );
    this.canvas.addEventListener(
        'mousemove', mousemoveListener.bind(this), false
    );
    this.canvas.addEventListener(
        'touchstart', mousedownListener.bind(this), false
    );
    this.canvas.addEventListener(
        'touchmove', mousemoveListener.bind(this), false
    );
    this.canvas.addEventListener(
        'touchend', mouseupListener.bind(this), false
    );
}

let DrawingCanvas = function(divId, options) {
    this.stylingOptions = Object.assign({}, STANDARD_OPTIONS, options);
    this.canvasDiv = document.getElementById(divId);
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('class', 'DrawingCanvas');
    // hack so that elements can be fully loaded to get attributes
    setTimeout(() => {
        this.width = this.canvasDiv.clientWidth;
        this.height = this.canvasDiv.clientHeight;
        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);
    }, 0);
    this.canvasDiv.appendChild(this.canvas);
    this.paint = false;
    setEventListeners.apply(this);
    this.context = this.canvas.getContext('2d');
    // save original context for transformations
    this.context.save();
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickSize = [];
    this.lastDraw = 0;
    this.zoom = 0;
    this.scaleX = 1;
    this.scaleY = 1;
};

DrawingCanvas.prototype.updateOptions = function(options) {
    Object.assign(this.stylingOptions, options);
};

DrawingCanvas.prototype.changeZoom = function(zoom) {
    if (isNaN(zoom) || zoom < 0) {
        throw new Error('zoom must be an integer bigger than zero');
    }
    this.zoom = zoom;
    this.scaleX = 1 - zoom*0.1;
    this.scaleY = 1 - zoom*0.1;
    this.redraw(true);
};

DrawingCanvas.prototype.addClick = function(x, y, dragging) {
    this.clickX.push(x/this.scaleX);
    this.clickY.push(y/this.scaleY);
    this.clickDrag.push(dragging);
    this.clickColor.push(this.stylingOptions.colour);
    this.clickSize.push(this.stylingOptions.width);
};

DrawingCanvas.prototype.redraw = function(hard = false) {
    this.context.lineJoin = 'round';
    let radius;
    if (hard) {
        // restore original context to clear full canvas
        this.context.restore();
        this.context.clearRect(
            0, 0, this.width, this.height
        );
        // save it again for transformations
        this.context.save();
        this.context.scale(this.scaleX, this.scaleY);
        this.lastDraw = 0;
    }
    for (let i = this.lastDraw; i < this.clickX.length; i++) {
        if (this.clickSize[i] === 'small') {
            radius = 2;
        } else if (this.clickSize[i] === 'normal') {
            radius = 5;
        } else if (this.clickSize[i] === 'large') {
            radius = 10;
        } else if (this.clickSize[i] === 'huge') {
            radius = 20;
        } else {
            radius = 0;
        }
        this.context.beginPath();
        this.context.strokeStyle = this.clickColor[i];
        if (this.clickDrag[i] && i) {
            this.context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
        } else {
            this.context.moveTo(this.clickX[i] - 1, this.clickY[i]);
        }
        this.context.lineTo(this.clickX[i], this.clickY[i]);
        this.context.closePath();
        this.context.lineWidth = radius;
        this.context.stroke();
    }
    this.lastDraw = this.clickX.length;
};

DrawingCanvas.prototype.addImage = function(inputImg, x, y) {
    this.context.drawImage(
        inputImg, 0, 0, 100, 100, x, y, this.scaleX, this.scaleY
    );
};

module.exports = DrawingCanvas;
