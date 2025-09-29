// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;

// Centralised immutable object to make config changes a little easier.
const CONFIG = Object.freeze({
    CANVAS_ID: 'canvas-digital-rain',
    FONT_SIZE: 16,
    FONT_FAMILY: 'monospace',
});

window.addEventListener('load', init);

function init() {
    canvas = document.getElementById(CONFIG.CANVAS_ID);
    if (!canvas) {
        console.error(`Canvas element with id="${CONFIG.CANVAS_ID}" not found.`);
        return;
    }
    ctx = canvas.getContext('2d');
    ctx.font = `${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;

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
