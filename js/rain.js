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
    SPEED: 0.3,
    SPEED_VARIATION: 0.2,
    COLOURS: {
        BACKGROUND: 'rgba(0, 0, 0, 0.05)', // semi-transparent black
        GREENS: ['#0F0', '#0C0', '#0A0', '#090', '#060', '#030'] // matrix greens
    }
});

// Character set for the digital rain effect.
const CHARACTERS = {
    latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',

    get all() {
        return this.latin + this.katakana;
    }
};

window.addEventListener('load', init);

// Initialise the canvas and start the animation loop.
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

    // // Initialise 1 raindrop for testing
    // raindrops = [];
    // raindrops[0] = {};
    // raindrops[0].speed = CONFIG.SPEED + (Math.random() - 0.5) * CONFIG.SPEED_VARIATION;
    // raindrops[0].y = 0;

    // Initialise raindrops with positions + unique speeds
    raindrops = Array.from({ length: columns }, () => ({
        y: 0,
        speed: CONFIG.SPEED + (Math.random() - 0.5) * CONFIG.SPEED_VARIATION
    }));

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
        raindrops[i].y += raindrops[i].speed;

        // Reset raindrop to top when it goes off screen
        if (raindrops[i].y * CONFIG.FONT_SIZE > canvas.height) {
            raindrops[i].y = 0;
        }
    }
}

// Render the current frame.
function draw() {
    ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < raindrops.length; i++) {
        const x = i * CONFIG.FONT_SIZE;
        const y = Math.floor(raindrops[i].y) * CONFIG.FONT_SIZE; // Use the y position of the raindrop
        const char = getRandomCharacter();
        ctx.fillStyle = CONFIG.COLOURS.GREENS[Math.floor(Math.random() * CONFIG.COLOURS.GREENS.length)];
        ctx.fillText(char, x, y);
    }
}

// Get a random character from our matrix character set.
function getRandomCharacter() {
    const chars = CHARACTERS.all;
    return chars[Math.floor(Math.random() * chars.length)];
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
