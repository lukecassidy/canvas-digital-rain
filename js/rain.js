// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;
let columns, rows;
let raindrops = [];

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

    // Calculate number of rows and columns that fit on the canvas
    columns = Math.floor(canvas.width / CONFIG.FONT_SIZE);
    rows = Math.floor(canvas.height / CONFIG.FONT_SIZE);

    // columns = 1; // Temp override
    raindrops = Array.from({ length: columns }, () => 0);
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
    // Move each raindrop down one position
    for (let i = 0; i < raindrops.length; i++) {
        raindrops[i]++;

        // Reset raindrop to top when it goes off screen
        if (raindrops[i] * CONFIG.FONT_SIZE > canvas.height) {
            raindrops[i] = 0;
        }
    }
}

// Render the current frame.
function draw() {
    ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CONFIG.COLOURS.TEXT;

    // Draw each raindrop in its column
    for (let i = 0; i < raindrops.length; i++) {
        const x = i * CONFIG.FONT_SIZE;
        const y = raindrops[i] * CONFIG.FONT_SIZE;
        const char = '0';
        ctx.fillText(char, x, y);
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
