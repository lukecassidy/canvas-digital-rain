// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;
let digitalRain;

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

// Class representing a single falling character.
class RainDrop {
    constructor(column, row, fontSize, canvas) {
        this.column = column;
        this.row = row;
        this.fontSize = fontSize;
        this.canvas = canvas;
        this.message = null;
        this.messageIndex = 0;
    }

    update() {
        if (this.row * this.fontSize > this.canvas.height && Math.random() > 0.975) {
            this.reset();
        } else {
            this.row++;
        }
    }

    reset() {
        this.row = 0;
        this.message = null;
        this.messageIndex = 0;
    }

    getCharacter() {
        let char;
        let colour = CONFIG.COLOURS.GREENS[
            Math.floor(Math.random() * CONFIG.COLOURS.GREENS.length)
        ];

        if (this.message) {
            char = this.message[this.messageIndex];
            colour = CONFIG.HIDDEN_MESSAGE_COLOUR;
            this.messageIndex++;

            if (this.messageIndex >= this.message.length) {
                this.message = null;
                this.messageIndex = 0;
            }
        } else if (Math.random() < CONFIG.MESSAGE_CHANCE) {
            this.message = CONFIG.HIDDEN_MESSAGE;
            this.messageIndex = 0;
            char = this.message[this.messageIndex++];
            colour = CONFIG.HIDDEN_MESSAGE_COLOUR;
        } else {
            char = this.getRandomCharacter();
        }

        return { char, colour };
    }

    getRandomCharacter() {
        const chars = CHARACTERS.all;
        return chars[Math.floor(Math.random() * chars.length)];
    }
}

// Class representing the full digital rain effect.
class DigitalRain {
    constructor(ctx, canvas, fontSize) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.fontSize = fontSize;

        this.columns = Math.floor(canvas.width / fontSize);
        this.rows = Math.floor(canvas.height / fontSize);
        this.drops = [];

        // Initialize raindrop positions
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = new RainDrop(i, Math.floor(Math.random() * this.rows), fontSize, canvas);
        }
    }

    update() {
        for (let drop of this.drops) {
            drop.update();
        }
    }

    draw() {
        this.ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let drop of this.drops) {
            const x = drop.column * this.fontSize;
            const y = drop.row * this.fontSize;
            const { char, colour } = drop.getCharacter();

            this.ctx.fillStyle = colour;
            this.ctx.fillText(char, x, y);
        }
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

    digitalRain = new DigitalRain(ctx, canvas, CONFIG.FONT_SIZE);

    requestAnimFrame(animationLoop);
}

// Update the state of the animation.
function update() {
    digitalRain.update();
}

// Render the current frame.
function draw() {
    digitalRain.draw();
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
