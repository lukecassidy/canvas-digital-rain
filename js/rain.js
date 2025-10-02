// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;
let columns, rows;
let raindrops = [];

// Using our own timing to control speed of character steps.
let previousTimestamp = 0; // timestamp of the previous frame
let timeSinceLastStep = 0; // time in ms since last character step

// Centralised immutable object to make config changes a little easier.
const CONFIG = Object.freeze({
    CANVAS_ID: 'canvas-digital-rain',
    FONT_SIZE: 16,
    FONT_FAMILY: 'monospace',
    TIME_STEP: 100, // time in ms between character steps
    COLOURS: {
        BACKGROUND: 'rgba(0, 0, 0, 0.09)', // semi-transparent black
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
    ctx.textBaseline = 'top';

    // Calculate number of rows and columns that fit on the canvas
    columns = Math.floor(canvas.width / CONFIG.FONT_SIZE);
    rows = Math.floor(canvas.height / CONFIG.FONT_SIZE);

    // Initialize raindrop positions
    for (let i = 0; i < columns; i++) {
        raindrops[i] = {
            column: i,
            row: Math.floor(Math.random() * rows)
        };
    }

    requestAnimFrame(animationLoop);
}

// Main loop where we update state, draw, schedule next frame.
function animationLoop(timestamp) {
    const timeDelta = timestamp - previousTimestamp;
    previousTimestamp = timestamp;
    timeSinceLastStep += timeDelta;

    // Update/draw only if enough time has passed
    if (timeSinceLastStep > CONFIG.TIME_STEP) {
        timeSinceLastStep = 0;
        update();
        draw();
    }

    requestAnimFrame(animationLoop);
}

// Update the state of the animation.
function update() {
    for (let drop of raindrops) {
        // Reset raindrop to top after it goes off screen
        if (drop.row * CONFIG.FONT_SIZE > canvas.height && Math.random() > 0.975) {
            drop.row = 0;
        } else {
            // Move raindrop down one row
            drop.row++;
        }
    }
}

// Render the current frame.
function draw() {
    ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each raindrop character.
    for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        const x = drop.column * CONFIG.FONT_SIZE;
        const y = drop.row * CONFIG.FONT_SIZE;
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
