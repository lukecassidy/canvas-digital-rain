// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;
let columns, rows;

// Centralised immutable object to make config changes a little easier.
const CONFIG = Object.freeze({
    CANVAS_ID: 'canvas-digital-rain',
    FONT_SIZE: 16,
    FONT_FAMILY: 'monospace',
    COLOURS: {
        BACKGROUND: 'rgba(0, 0, 0, 0.05)', // semi-transparent black
        TEXT: '#0F0',                      // matrix green
    }
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

// Update the state of the animation.
function update() {
    // placeholder
}

// Render the current frame.
function draw() {
    ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CONFIG.COLOURS.TEXT;

    // Calculate number of rows and columns that fit on the canvas
    columns = Math.floor(canvas.width / CONFIG.FONT_SIZE);
    rows = Math.floor(canvas.height / CONFIG.FONT_SIZE);

    // Draw characters row by row
    for (let y = 0; y < rows; y++) {
        // Draw characters in each column
        for (let i = 0; i < columns; i++) {
            const x = i * CONFIG.FONT_SIZE;
            const char = '0';
            ctx.fillText(char, x, y * CONFIG.FONT_SIZE);
        }
    }
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
