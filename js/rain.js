// Enable strict mode for cleaner, safer JavaScript.
'use strict';

// Centralised immutable object to make config changes a little easier.
const CONFIG = Object.freeze({
    CANVAS_ID: 'canvas-digital-rain',
    FONT_SIZE: 16,
    FONT_FAMILY: 'monospace',
    TIME_STEP: 100, // Time in ms between updates
    HIDDEN_MESSAGE: 'lukeiscool',
    HIDDEN_MESSAGE_COLOUR: '#0FF',
    HIDDEN_MESSAGE_CHANCE: 0.02,
    RESET_THRESHOLD: 0.975,
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

// Represents a single vertical stream of characters.
class RainStream {
    constructor(column, fontSize, canvas) {
        this.column = column;
        this.fontSize = fontSize;
        this.canvas = canvas;
        this.row = Math.floor(Math.random() * Math.floor(canvas.height / fontSize));
        this.message = null;
        this.messageIndex = 0;
    }

    update() {
        if (this.row * this.fontSize > this.canvas.height && Math.random() > CONFIG.RESET_THRESHOLD) {
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
        } else if (Math.random() < CONFIG.HIDDEN_MESSAGE_CHANCE) {
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

// Manages the full rain effect: all streams, updates, and drawing.
class DigitalRain {
    constructor(ctx, canvas, fontSize) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.fontSize = fontSize;
        this.columns = Math.floor(canvas.width / fontSize);
        this.streams = [];
        // Initialize one stream per column
        for (let i = 0; i < this.columns; i++) {
            this.streams.push(new RainStream(i, fontSize, canvas));
        }
    }

    // Update all streams
    update() {
        for (const stream of this.streams) {
            stream.update();
        }
    }

    // Draw the current state of all streams
    draw() {
        this.ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const stream of this.streams) {
            const x = stream.column * this.fontSize;
            const y = stream.row * this.fontSize;
            const { char, colour } = stream.getCharacter();

            this.ctx.fillStyle = colour;
            this.ctx.fillText(char, x, y);
        }
    }
}

// Animation runner that manages time-based updates.
class AnimationRunner {
    constructor(effect, timeStep) {
        this.effect = effect;
        this.timeStep = timeStep;
        this.previousTimestamp = 0;
        this.timeSinceLastStep = 0;
        this.loop = this.loop.bind(this);
    }

    start() {
        requestAnimFrame(this.loop);
    }

    loop(currentTimestamp) {
        const timeDelta = currentTimestamp - this.previousTimestamp;
        this.previousTimestamp = currentTimestamp;
        this.timeSinceLastStep += timeDelta;

        // Update/draw only if enough time has passed
        if (this.timeSinceLastStep > this.timeStep) {
            this.timeSinceLastStep = 0;
            this.effect.update();
            this.effect.draw();
        }

        requestAnimFrame(this.loop);
    }
}

// Initialise the animation when the window loads.
window.addEventListener('load', () => {
    const canvas = document.getElementById(CONFIG.CANVAS_ID);
    if (!canvas) {
        console.error(`Canvas element with id="${CONFIG.CANVAS_ID}" not found.`);
        return;
    }

    const ctx = canvas.getContext('2d');
    ctx.font = `${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
    ctx.textBaseline = 'top';

    const dr = new DigitalRain(ctx, canvas, CONFIG.FONT_SIZE);
    new AnimationRunner(dr, CONFIG.TIME_STEP).start();
});

// Polyfill for cross browser requestAnimationFrame support.
window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 30);
        }
    );
})();
