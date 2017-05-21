'use strict';

import './../style.css';
import EventEmitter from 'eventemitter3';
import Hammer from 'hammerjs';

/**
 * @typedef {Object} DrawingTools
 * @property {String} PEN - pen
 * @property {String} ERASER - eraser
 */

const DRAWING_TOOLS = {
    PEN: 'pen',
    ERASER: 'eraser'
};

/**
 * @typedef {Object} Options
 * @property {String} color - stroke color
 * @property {Number} width - stroke width
 * @property {String} type - drawing tool
 */

const STANDARD_OPTIONS = {
    color: '#000000',
    width: 10,
    type: DRAWING_TOOLS.PEN
};

/**
 * listener to click on canvas
 * @private
 * @param {Object} e - event data
 * @returns {void}
 */
function mousedownListener(e) {
    let mouseX = e.pageX - this._canvasDiv.offsetLeft;
    let mouseY = e.pageY - this._canvasDiv.offsetTop;

    this._paint = true;
    // click will start on next index
    // save to be able to undo
    this._clickStarts.push(this._lastDrawIndex + 1);
    this._addClick(mouseX, mouseY, false);
}

/**
 * listener to move on canvas
 * @private
 * @param {Object} e - event data
 * @returns {void}
 */
function mousemoveListener(e) {
    let drawingAreaX = this._width;
    let drawingAreaY = this._height;
    let drawingAreaWidth = 10;

    let mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) -
        this._canvasDiv.offsetLeft;
    let mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) -
        this._canvasDiv.offsetTop;
    if (mouseX < drawingAreaX && mouseY < drawingAreaY) {
        if (mouseX > drawingAreaWidth && mouseY > 0) {
            if (this._paint) {
                this._addClick(mouseX, mouseY, true);
                this._wrapAndEmitClicks();
            }
        }
    } else {
        if (this._paint) {
            this._addClick(mouseX, mouseY, false);
            this._wrapAndEmitClicks();
        }
    }
    // Prevent the whole page from dragging if on mobile
    e.preventDefault();
}

/**
 * listener to finishing draw on canvas
 * @private
 * @returns {void}
 */
function mouseupListener() {
    this._paint = false;
    this._wrapAndEmitClicks();
}

function pressListener(e) {
    console.log(e);
}

function resizeListener() {
    this._width = this._canvasDiv.clientWidth;
    this._height = this._canvasDiv.clientHeight;
    setTimeout(() => {
        this._canvas.setAttribute('width', this._width - 10);
        this._canvas.setAttribute('height', this._height - 10);
        this._redraw(true);
    }, 0);
}

/**
 * set click listeners on canvas
 * @private
 * @returns {void}
 */
function setEventListeners() {
    this._canvas.addEventListener(
        'mousedown', mousedownListener.bind(this), false
    );
    this._canvas.addEventListener(
        'mouseup', mouseupListener.bind(this), false
    );
    this._canvas.addEventListener(
        'mousemove', mousemoveListener.bind(this), false
    );
    this._canvas.addEventListener(
        'touchstart', mousedownListener.bind(this), false
    );
    this._canvas.addEventListener(
        'touchmove', mousemoveListener.bind(this), false
    );
    this._canvas.addEventListener(
        'touchend', mouseupListener.bind(this), false
    );
    window.addEventListener('resize', resizeListener.bind(this), false);
    let hammertime = new Hammer(this._canvas);
    hammertime.on('press', pressListener);
}

/**
 * Class to do rendering and get user inputs from drawr drawing solution
 */
export default class DrawrCanvas {
    /**
     * creates a new canvas
     * @param {String} divId - div where canvas should be created
     * @param {Options} options - styling options for the canvas
     * @returns {void}
     */
    constructor(divId, options) {
        this._stylingOptions = Object.assign({}, STANDARD_OPTIONS, options);
        this._canvasDiv = document.getElementById(divId);
        this._canvas = document.createElement('canvas');
        this._canvas.setAttribute('class', 'DrawrCanvas');
        // hack so that elements can be fully loaded to get attributes
        this._width = this._canvasDiv.clientWidth;
        this._height = this._canvasDiv.clientHeight;
        setTimeout(() => {
            this._canvas.setAttribute('width', this._width);
            this._canvas.setAttribute('height', this._height);
        }, 0);
        this._canvasDiv.appendChild(this._canvas);
        this._paint = false;
        setEventListeners.apply(this);
        this._context = this._canvas.getContext('2d');
        this._eventEmitter = new EventEmitter();
        // save original context for transformations
        this._context.save();
        this._clicks = [];
        this._zoom = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._lastDrawIndex = 0;
        this._clickStarts = [];
        this._redoClicks = [];
        this._lastEmittedDrag = 0;
    }

    /**
     * add and draw changes to canvas
     * @private
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @param {Boolean} dragging - if point should be connected to last one
     * @returns {void}
     */
    _addClick(x, y, dragging) {
        this._clicks.push({
            x: x/this._width,
            y: y/this._height,
            drag: dragging,
            style: Object.assign({}, this._stylingOptions),
            remote: false
        });
        this._redraw();
    }

    /**
     * get index of last click made by local user
     * @private
     * @param {Number} index - index from where to start looking
     * @return {Number} index - last local index from given click
     */
    _getLastLocalClick(index) {
        for (let i = index; i >= 0; i--) {
            if (!this._clicks[i].remote) {
                return i;
            }
        }
    }

    /**
     * add clicks coming from server
     * @private
     * @param {Boolean} hard - if true, clears and rescale canvas, and redraws all clicks
     * @returns {void}
     */
    _redraw(hard = false) {
        this._context.lineJoin = 'round';
        if (hard) {
            this._clearCanvas();
        }
        for (let i = this._lastDrawIndex; i < this._clicks.length; i++) {
            this._context.beginPath();
            this._context.strokeStyle = this._clicks[i].style.color;
            if (this._clicks[i].drag && i && !this._clicks[i].pathStart) {
                if (this._clicks[i].remote) {
                    this._context.moveTo(
                        this._clicks[i-1].x * this._width,
                        this._clicks[i-1].y * this._height
                    );
                } else {
                    // remote clicks might be rendered while user is dragging
                    // if this is the case, point should be connected to last local click, not a remote one
                    let lastLocalClick = this._getLastLocalClick(i-1);
                    if (lastLocalClick) {
                        this._context.moveTo(
                            this._clicks[lastLocalClick].x * this._width,
                            this._clicks[lastLocalClick].y * this._height
                        );
                    }
                }
            } else {
                this._context.moveTo(
                    (this._clicks[i].x * this._width) - 1,
                    this._clicks[i].y * this._height
                );
            }
            this._context.lineTo(
                this._clicks[i].x * this._width,
                this._clicks[i].y * this._height
            );
            this._context.closePath();
            this._context.lineWidth = this._clicks[i].style.width;
            this._context.stroke();
        }
        this._lastDrawIndex =
            this._clicks.length > 0 ? (this._clicks.length - 1) : 0;
    }

    _wrapAndEmitClicks() {
        let clicks = [];
        let totalLength = this._clicks.length - 1;
        // add last click
        let clickCp = Object.assign(
            {}, this._clicks[totalLength], {remote: true});
        clicks.push(clickCp);
        if (clicks[0].drag) {
            // add all dragging clicks not emitted so far
            let lastLocalClick = this._getLastLocalClick(totalLength - 1);
            while (lastLocalClick > this._lastEmittedDrag &&
                this._clicks[lastLocalClick].drag && lastLocalClick
            ) {
                this._lastEmittedDrag = lastLocalClick;
                let clickCp = Object.assign(
                    {}, this._clicks[lastLocalClick], {remote: true}
                );
                clicks.unshift(clickCp);
                lastLocalClick = this._getLastLocalClick(lastLocalClick - 1);
            }
        }
        clicks[0].pathStart = true;
        this._eventEmitter.emit('new-click', clicks);
    }

    /**
     * clear all clicks from canvas
     * @returns {void}
     */
    _clearCanvas() {
        // restore original context to clear full canvas
        this._context.restore();
        this._context.clearRect(
            0, 0, this._width, this._height
        );
        // save it again for transformations
        this._context.save();

        this._context.scale(this._scaleX, this._scaleY);
        this._lastDrawIndex = 0;
    }

    /* PUBLIC API */

    /**
     * resets to initial started
     * @return {void}
     */
    reset() {
        this._clicks = [];
        this._zoom = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._clearCanvas();
    }

    /**
     * add image to canvas at given coordinates
     * @param {Object} img - image to be draw
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @returns {void}
     */
    addImage(img, x, y) {
        this._context.drawImage(
            img, 0, 0, 100, 100, x, y, this._scaleX, this._scaleY
        );
    }

    /**
     * add clicks coming from server
     * @param {Object} clicks - clicks coming from server
     * @returns {void}
     */
    remoteUpdate(clicks) {
        this._clickStarts.push(this._lastDrawIndex + 1);
        this._clicks = this._clicks.concat(clicks);
        this._redraw();
    }

    /**
     * updates styling options
     * @param {Options} options - new option to be set
     * @returns {void}
     */
    updateOptions(options) {
        if (options.type === DRAWING_TOOLS.ERASER) {
            options.color = '#FFFFFF';
        }
        Object.assign(this._stylingOptions, options);
    }

    /**
     * set new zoom level and calls redraw
     * @param {Number} zoom - new zoom level
     * @returns {void}
     */
    setZoom(zoom) {
        if (isNaN(zoom) || zoom < 0) {
            throw new TypeError(
                'zoom must be an integer equal or bigger than zero'
            );
        }
        this._zoom = zoom;
        this._scaleX = 1 - this._zoom*0.1;
        this._scaleY = 1 - this._zoom*0.1;
        this._redraw(true);
    }

    /**
     * add listener to canvas event
     * @param {String} name - event name
     * @param {Function} listener - function to be executed on event
     * @param {Context} context - context (this value) to execute listener
     * @returns {void}
     */
    addEventListener(name, listener, context) {
        if (typeof name !== 'string') {
            throw new TypeError('event name must be a string');
        }
        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }
        this._eventEmitter.on(name, listener, context);
    }

    /**
     * undo last click
     * @returns {void}
     */
    undoLastClick() {
        if (this._clickStarts.length > 0) {
            let initialIndex = this._clickStarts.pop();
            if (initialIndex) {
                this._redoClicks.push(this._clicks.splice(
                    initialIndex, this._clicks.length - initialIndex
                ));
                this._redraw(true);
            }
        }
    }

    /**
     * redo last click
     * @returns {void}
     */
    redoLastClick() {
        if (this._redoClicks.length > 0) {
            this._clicks = this._clicks.concat(this._redoClicks.pop());
            this._redraw(true);
        }
    }

    /**
     * gets all clicks drawn on canvas
     * @return {Array} clicks - all clicks on canvas instance
     */
    getAllClicks() {
        return this._clicks.slice();
    }

    /** @type {DrawingTools} */
    static get drawingTools() {
        return DRAWING_TOOLS;
    }

}
