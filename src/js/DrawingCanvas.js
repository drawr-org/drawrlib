'use strict';

let scaleX = 1.5;
let scaleY = 1.2;

function mousedownListener(e) {
    let mouseX = e.pageX - this.offsetLeft;
    let mouseY = e.pageY - this.offsetTop;

    this.paint = true;
    this.addClick(mouseX, mouseY, false);
    this.redraw();
}

function mousemoveListener(e) {
    let drawingAreaX = 290;
    let drawingAreaY = 590;
    let drawingAreaWidth = 10;
    // let drawingAreaHeight = 10;

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

let DrawingCanvas = function(divId) {
    this.stylingOptions = {
        colour: '#ffcf33',
        width: 'large',
        type: 'pen'
    };
    this.canvasDiv = document.getElementById(divId);
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', '300'*scaleX);
    this.canvas.setAttribute('height', '600'*scaleY);
    this.canvas.setAttribute('class', 'DrawingCanvas');
    this.canvasDiv.appendChild(this.canvas);
    this.paint = false;
    setEventListeners.apply(this);
    this.context = this.canvas.getContext('2d');
    this.context.scale(scaleX, scaleY);
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickSize = [];
    this.lastDraw = 0;
};

DrawingCanvas.prototype.addClick = function(x, y, dragging) {
    this.clickX.push(x/scaleX);
    this.clickY.push(y/scaleY);
    this.clickDrag.push(dragging);
    this.clickColor.push(this.stylingOptions.colour);
    this.clickSize.push(this.stylingOptions.width);
};

DrawingCanvas.prototype.redraw = function() {
    this.context.lineJoin = 'round';
    let radius = 5;
    for (let i = this.lastDraw; i < this.clickX.length; i++) {
        if (this.clickSize[i] == 'small') {
            radius = 2;
        } else if (this.clickSize[i] == 'normal') {
            radius = 5;
        } else if (this.clickSize[i] == 'large') {
            radius = 10;
        } else if (this.clickSize[i] == 'huge') {
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
    this.context.drawImage(inputImg, 0, 0, 100, 100, x, y, scaleX, scaleY);
};

module.exports = DrawingCanvas;
