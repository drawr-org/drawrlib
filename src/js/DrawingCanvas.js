'use strict';

let drawingAreaX = 290;
let drawingAreaY = 590;
let drawingAreaWidth = 10;
let drawingAreaHeight = 10;
let toolHotspotStartY = 10;
let toolHotspotHeight = 10;
let curTool = "crayon";

function mousedownListener(e) {

    let mouseX = e.pageX - this.offsetLeft;
		let mouseY = e.pageY - this.offsetTop;

    		this.paint = true;
    		this.addClick(mouseX, mouseY, false);
    		this.redraw();
}

function mousemoveListener(e) {
    let mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) -
        this.canvas.offsetLeft;
    let mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) -
        this.canvas.offsetTop;
    if(mouseX < drawingAreaX && mouseY < drawingAreaY)
    {
      if(mouseX > drawingAreaWidth && mouseY > 0)
      {
        if (this.paint) {
            this.addClick(
                mouseX, mouseY, true
            );
            this.redraw();
        }
        // Prevent the whole page from dragging if on mobile
        e.preventDefault();
      }
      else {
        if (this.paint) {
            this.addClick(
                mouseX, mouseY, false
            );
            this.redraw();
        }
      }

    }
    else {
      if (this.paint) {
          this.addClick(
              mouseX, mouseY, false
          );
          this.redraw();
      }
      // Prevent the whole page from dragging if on mobile
      e.preventDefault();
    }
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
    this.clickSize = [];
}

DrawingCanvas.prototype.addClick = function(x, y, dragging) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
    this.clickColor.push(this.stylingOptions.colour);
    this.clickSize.push(this.stylingOptions.width);
};

DrawingCanvas.prototype.redraw = function() {
    this.context.clearRect(
        0, 0, this.context.canvas.width, this.context.canvas.height
    );
    this.context.lineJoin = 'round';
    let radius = 5;
    for (let i = 0; i < this.clickX.length; i++) {
        if(this.clickSize[i] == "small") {
          radius = 2;
        } else if (this.clickSize[i] == "normal") {
          radius = 5;
        } else if (this.clickSize[i] == "large") {
          radius = 10;
        } else if (this.clickSize[i] == "huge") {
          radius = 20;
        } else {
          radius = 0;
        }
        this.context.beginPath();
        this.context.strokeStyle = this.clickColor[i];
        if (this.clickDrag[i] && i) {
            this.context.moveTo(this.clickX[i-1], this.clickY[i-1]);
        } else {
            this.context.moveTo(this.clickX[i] - 1, this.clickY[i]);
        }
        this.context.lineTo(this.clickX[i], this.clickY[i]);
        this.context.closePath();
        this.context.lineWidth = radius;
        this.context.stroke();
    }
};

module.exports = DrawingCanvas;
