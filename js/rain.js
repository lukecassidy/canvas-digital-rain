// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;
let rainStream;

// Using our own timing to control speed of character steps.
let previousTimestamp = 0; // timestamp of the previous frame
let timeSinceLastStep = 0; // time in ms since last character step

// Centralised immutable object to make config changes a little easier.
const CONFIG = Object.freeze({
    CANVAS_ID: 'canvas-digital-rain',
    FONT_SIZE: 16,
    FONT_FAMILY: 'monospace',
    TIME_STEP: 100, // time in ms between character steps
    HIDDEN_MESSAGE: 'lukeiscool',
    HIDDEN_MESSAGE_COLOUR: '#0FF',
    MESSAGE_CHANCE: 0.02, // ~0.2% chance each frame for a drop to start message
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

// Class representing a stream of falling chars.
class RainStream {
    constructor(ctx, canvas, fontSize) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.fontSize = fontSize;

        this.columns = Math.floor(canvas.width / fontSize);
        this.rows = Math.floor(canvas.height / fontSize);
        this.drops = [];

        // Initialize raindrop positions
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = {
                column: i,
                row: Math.floor(Math.random() * this.rows),
                message: null,
                messageIndex: 0
            };
        }
    }

    update() {
        for (let drop of this.drops) {
            // Reset drop to top randomly after it goes off screen.
            if (drop.row * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                drop.row = 0;
                drop.message = null;
                drop.messageIndex = 0;
            } else {
                // Move drop down one row.
                drop.row++;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let drop of this.drops) {
            const x = drop.column * this.fontSize;
            const y = drop.row * this.fontSize;

            const { char, colour } = this.getCharacterForDrop(drop);

            this.ctx.fillStyle = colour;
            this.ctx.fillText(char, x, y);
        }
    }

    // Decide which character/colour a drop should render
    getCharacterForDrop(drop) {
        let char;
        let colour = CONFIG.COLOURS.GREENS[
            Math.floor(Math.random() * CONFIG.COLOURS.GREENS.length)
        ];

        if (drop.message) {
            // Continue printing hidden message
            char = drop.message[drop.messageIndex];
            colour = CONFIG.HIDDEN_MESSAGE_COLOUR;
            drop.messageIndex++;

            if (drop.messageIndex >= drop.message.length) {
                drop.message = null;
                drop.messageIndex = 0;
            }
        } else if (Math.random() < CONFIG.MESSAGE_CHANCE) {
            // Start hidden message
            drop.message = CONFIG.HIDDEN_MESSAGE;
            drop.messageIndex = 0;
            char = drop.message[drop.messageIndex++];
            colour = CONFIG.HIDDEN_MESSAGE_COLOUR;
        } else {
            // Default random character
            char = this.getRandomCharacter();
        }

        return { char, colour };
    }

    // Get a random character from the character set.
    getRandomCharacter() {
        const chars = CHARACTERS.all;
        return chars[Math.floor(Math.random() * chars.length)];
    }
}

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

    rainStream = new RainStream(ctx, canvas, CONFIG.FONT_SIZE);

    requestAnimFrame(animationLoop);
}

// Update the state of the animation.
function update() {
    rainStream.update();
}

// Render the current frame.
function draw() {
    rainStream.draw();
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
