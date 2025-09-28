// Enable strict mode for cleaner, safer JavaScript.
'use strict';


let canvas, ctx;

// Centralised immutable object to make config changes a little easier.
const CONFIG = Object.freeze({
    // placeholder 
});

window.addEventListener('load', init);

function init() {
    canvas = document.getElementById('canvas-digital-rain');
    if (!canvas) {
        console.error('Canvas element with id="canvas-digital-rain" not found.');
        return;
    }
    ctx = canvas.getContext('2d');
    animationLoop();
}

// Main loop where we update state, draw, schedule next frame.
function animationLoop() {
    update();
    draw();
    requestAnimFrame(animationLoop);
}

// Update the state of thd rain.
function update() {
    // placeholder
}

// Render the current frame.
function draw() {
    // placeholder
}

// Polyfill for cross browser requestAnimationFrame support.
window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            // Fallback to 30 FPS
            window.setTimeout(callback, 1000 / 30);
        }
    );
})();
