'use strict';

import './../style.css';
import EventEmitter from 'eventemitter3';
// import Hammer from 'hammerjs';

import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';


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
    color: 0x000000,
    width: 10,
    type: DRAWING_TOOLS.PEN
};

const MAX_LINE_POINTS = 500;

/**
 * listener to click on canvas
 * @private
 * @param {Object} e - event data
 * @returns {void}
 */
function mousedownListener(e) {
    if (e.touches) {
        // if multitouch, ignore it
        if (e.touches.length > 1) {
            return;
        }
    } else {
        // if right click, ignore it
        let rightClick = false;
        if (e.which) {
            rightClick = (e.which === 3);
        } else if (e.button) {
            rightClick = (e.button === 2);
        }
        if (rightClick) {
            return;
        }
    }
    let mouseVector = getMouseCoordinates.call(this, e);
    let geometry = new THREE.BufferGeometry();
    let material = new THREE.LineBasicMaterial({
        color: this._stylingOptions.color,
        linewidth: this._stylingOptions.width
    });
    let positions = new Float32Array(MAX_LINE_POINTS * 3);
    positions[0] = mouseVector.x;
    positions[1] = mouseVector.y;
    positions[2] = 0;
    positions[3] = mouseVector.x + 0.1;
    positions[4] = mouseVector.y + 0.1;
    positions[5] = 0;

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._currentLine = new THREE.Line(geometry, material);
    // if draw range is not set, a line from the origin is rendered as well
    this._currentLine.geometry.setDrawRange(0, 2);
    this._scene.add(this._currentLine);

    this._paint = true;
    this._currentLineIndex = 6;
    // click will start on next index
    // save to be able to undo
    // this._clickStarts.push(this._lastDrawIndex + 1);
    // this._addClick(mouseX, mouseY, false);
}

/**
 * listener to move on canvas
 * @private
 * @param {Object} e - event data
 * @returns {void}
 */
function mousemoveListener(e) {
    if (this._paint) {
        let mouseVector = getMouseCoordinates.call(this, e);
        let positions = this._currentLine.geometry.attributes.position.array;
        positions[this._currentLineIndex] = mouseVector.x;
        positions[this._currentLineIndex + 1] = mouseVector.y;
        positions[this._currentLineIndex + 2] = 0;

        this._currentLineIndex += 3;
        this._currentLine.geometry.attributes.position.needsUpdate = true;
        // if draw range is not set, a line from the origin is rendered as well
        this._currentLine.geometry.setDrawRange(0, this._currentLineIndex / 3);
    }
    // Prevent the whole page from dragging if on mobile
    e.preventDefault();
}

function getMouseCoordinates(e) {
    let mouseVector = new THREE.Vector3(
        2 * ((e.clientX - this._canvasDiv.offsetLeft) / this._width) - 1,
        1 - 2 * ((e.clientY - this._canvasDiv.offsetTop) / this._height),
        0);
    mouseVector.unproject(this._camera);
    return mouseVector;
}

/**
 * listener to finishing draw on canvas
 * @private
 * @returns {void}
 */
function mouseupListener() {
    this._paint = false;
    // this._wrapAndEmitClicks();
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
    this._canvasDiv.addEventListener(
        'mousedown', mousedownListener.bind(this), false
    );
    this._canvasDiv.addEventListener(
        'mouseup', mouseupListener.bind(this), false
    );
    this._canvasDiv.addEventListener(
        'mousemove', mousemoveListener.bind(this), false
    );
    this._canvasDiv.addEventListener(
        'touchstart', mousedownListener.bind(this), false
    );
    this._canvasDiv.addEventListener(
        'touchmove', mousemoveListener.bind(this), false
    );
    this._canvasDiv.addEventListener(
        'touchend', mouseupListener.bind(this), false
    );
    window.addEventListener('resize', resizeListener.bind(this), false);
    // let hammertime = new Hammer(this._canvasDiv);
    // hammertime.on('press', pressListener);
    // hammertime.on('zoom', zoomListener);
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
        // this._canvas = document.createElement('canvas');
        // this._canvas.setAttribute('class', 'DrawrCanvas');
        // hack so that elements can be fully loaded to get attributes
        this._width = this._canvasDiv.clientWidth;
        this._height = this._canvasDiv.clientHeight;
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0xffffff);
        this._camera = new THREE.OrthographicCamera(
            this._width / -2, this._width / 2,
            this._height / 2, this._height / -2,
            1, 1000
        );
        this._camera.position.set(0, 0, 5);

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(this._width, this._height);
        this._canvasDiv.appendChild(this._renderer.domElement);
        this._controls = new OrbitControls(
            this._camera, this._renderer.domElement);
        this._controls.enabled = true;
        // view direction perpendicular to XY-plane
        this._controls.target.set( 0, 0, 0 );
        this._controls.enableRotate = false;

        this._controls.maxDistance = 1000;
        this._controls.minDistance = 1;

        function render() {
            window.requestAnimationFrame(render.bind(this));
            this._renderer.render(this._scene, this._camera);
        }
        render.apply(this);
        this._paint = false;
        setEventListeners.apply(this);

        this._eventEmitter = new EventEmitter();
        this._lastEmittedDrag = 0;
        this._currentLine;
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
