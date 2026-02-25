// Enable strict mode for cleaner, safer JavaScript.
'use strict';

// ---------------------------------------------------------------------------
// CONFIG
// Centralised immutable object to make config changes a little easier.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// ENTITY
// Represents a single vertical stream of characters.
// ---------------------------------------------------------------------------

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
            char = Helper.getRandomCharacter();
        }

        return { char, colour };
    }

}

// ---------------------------------------------------------------------------
// SCENE
// Manages the full rain effect: all streams, updates, and drawing.
// ---------------------------------------------------------------------------

class RainScene {
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

// ---------------------------------------------------------------------------
// LOOP
// Drives the fixed-timestep loop — no need to modify this.
// Pass any Scene with update() and draw() methods.
// ---------------------------------------------------------------------------

class Loop {
    constructor(scene, timeStep) {
        this.scene = scene;
        this.timeStep = timeStep;
        this.lastTime = 0;
        this.accumulator = 0;
        this.tick = this.tick.bind(this);
    }

    start() {
        requestAnimFrame(this.tick);
    }

    tick(currentTimestamp) {
        const timeDelta = currentTimestamp - this.lastTime;
        this.lastTime = currentTimestamp;
        this.accumulator += timeDelta;

        // Update/draw only if enough time has passed
        if (this.accumulator > this.timeStep) {
            this.accumulator = 0;
            this.scene.update();
            this.scene.draw();
        }

        requestAnimFrame(this.tick);
    }
}

// ---------------------------------------------------------------------------
// HELPER
// Static utility methods shared across the codebase.
// ---------------------------------------------------------------------------

class Helper {
    static getRandomCharacter() {
        const chars = CHARACTERS.all;
        return chars[Math.floor(Math.random() * chars.length)];
    }
}

// ---------------------------------------------------------------------------

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

    const scene = new RainScene(ctx, canvas, CONFIG.FONT_SIZE);
    new Loop(scene, CONFIG.TIME_STEP).start();
});

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
