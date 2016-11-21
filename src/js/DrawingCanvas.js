'use strict';

function mousedownListener(e) {
    let mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) -
        this.canvas.offsetLeft;
    let mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) -
        this.canvas.offsetTop;
    this.paint = true;
    this.addClick(mouseX, mouseY, '#1a7fcc');
    this.redraw();
}

function mousemoveListener(e) {
    let mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) -
        this.canvas.offsetLeft;
    let mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) -
        this.canvas.offsetTop;
    if (this.paint) {
        this.addClick(mouseX, mouseY, '#1a7fcc', true);
        this.redraw();
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
    this.canvasDiv = document.getElementById(divId);
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', '300');
    this.canvas.setAttribute('height', '600');
    this.canvas.setAttribute('class', 'DrawingCanvas');
    this.canvasDiv.appendChild(this.canvas);
    this.paint = false;
    setEventListeners.apply(this);
    this.context = this.canvas.getContext('2d');
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
};

DrawingCanvas.prototype.addClick = function(x, y, color, dragging = false) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
    this.clickColor.push(color);
};

DrawingCanvas.prototype.redraw = function() {
    this.context.clearRect(
        0, 0, this.context.canvas.width, this.context.canvas.height
    );

    this.context.lineJoin = 'round';
    this.context.lineWidth = 5;

    for (let i = 0; i < this.clickX.length; i++) {
        this.context.beginPath();
        this.context.strokeStyle = this.clickColor[i];
        if (this.clickDrag[i] && i) {
            this.context.moveTo(this.clickX[i-1], this.clickY[i-1]);
        } else {
            this.context.moveTo(this.clickX[i] - 1, this.clickY[i]);
        }
        this.context.lineTo(this.clickX[i], this.clickY[i]);
        this.context.closePath();
        this.context.stroke();
    }
};

module.exports = DrawingCanvas;
