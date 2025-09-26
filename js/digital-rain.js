// Enable strict mode for cleaner, safer JavaScript.
'use strict';

let canvas, ctx;
const rainStreams = [];  // Active falling character streams

// Character sets for the digital rain effect
const CHARACTERS = {
    // Japanese Katakana characters
    katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
    // Additional characters for variety
    latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    // Combined character set
    get all() {
        return this.katakana + this.latin;
    }
};

// Configuration object for the digital rain effect
const CONFIG = Object.freeze({
    STREAM_SPAWN_PROBABILITY: 0.02,    // Chance to spawn new stream per frame
    FONT_SIZE: 14,                     // Size of characters
    STREAM_SPEED: 1,                   // Speed of falling characters
    STREAM_MIN_LENGTH: 5,              // Minimum characters in stream
    STREAM_MAX_LENGTH: 25,             // Maximum characters in stream
    FADE_ALPHA: 0.05,                  // Trail fade speed
    CHARACTER_CHANGE_PROBABILITY: 0.02, // Chance characters change per frame
    
    // Colors
    COLORS: {
        BRIGHT: '#00ff41',             // Bright green for leading characters
        MEDIUM: '#00cc33',             // Medium green
        DIM: '#008822',                // Dim green for trailing characters
        BACKGROUND: 'rgba(0, 0, 0, 0.05)' // Semi-transparent black for fade effect
    }
});

window.addEventListener('load', init);

function init() {
    canvas = document.getElementById('canvas-digital-rain');
    if (!canvas) {
        console.error('Canvas element with id="canvas-digital-rain" not found.');
        return;
    }
    
    // Set canvas to full window size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    ctx = canvas.getContext('2d');
    ctx.font = `${CONFIG.FONT_SIZE}px monospace`;
    
    animationLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Main animation loop
function animationLoop() {
    update();
    draw();
    requestAnimFrame(animationLoop);
}

// Update the state of all rain streams
function update() {
    // Randomly create new rain streams
    if (Math.random() < CONFIG.STREAM_SPAWN_PROBABILITY) {
        const columnWidth = CONFIG.FONT_SIZE;
        const maxColumns = Math.floor(canvas.width / columnWidth);
        const x = Math.floor(Math.random() * maxColumns) * columnWidth;
        
        rainStreams.push(new RainStream(x, -CONFIG.FONT_SIZE));
    }
    
    // Update existing streams
    for (let i = rainStreams.length - 1; i >= 0; i--) {
        rainStreams[i].update();
        
        // Remove streams that have moved off screen
        if (rainStreams[i].shouldRemove()) {
            rainStreams.splice(i, 1);
        }
    }
}

// Render the current frame
function draw() {
    // Create fade effect by drawing semi-transparent rectangle
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all rain streams
    for (let stream of rainStreams) {
        stream.draw();
    }
}

// Represents a stream of falling characters
class RainStream {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = CONFIG.STREAM_SPEED;
        this.length = random(CONFIG.STREAM_MIN_LENGTH, CONFIG.STREAM_MAX_LENGTH);
        this.characters = [];
        
        // Initialize the stream with random characters
        for (let i = 0; i < this.length; i++) {
            this.characters.push({
                char: getRandomCharacter(),
                brightness: Math.max(0, 1 - (i / this.length)) // Fade from bright to dim
            });
        }
    }
    
    update() {
        this.y += this.speed;
        
        // Randomly change characters to create the "falling code" effect
        if (Math.random() < CONFIG.CHARACTER_CHANGE_PROBABILITY) {
            for (let char of this.characters) {
                if (Math.random() < 0.1) { // Only change some characters
                    char.char = getRandomCharacter();
                }
            }
        }
    }
    
    draw() {
        for (let i = 0; i < this.characters.length; i++) {
            const charData = this.characters[i];
            const charY = this.y + (i * CONFIG.FONT_SIZE);
            
            // Don't draw characters above the screen
            if (charY < 0) continue;
            
            // Calculate color based on brightness and position in stream
            let color;
            if (i === 0) {
                // Leading character is brightest
                color = CONFIG.COLORS.BRIGHT;
            } else if (charData.brightness > 0.7) {
                color = CONFIG.COLORS.MEDIUM;
            } else {
                color = CONFIG.COLORS.DIM;
            }
            
            // Apply alpha based on brightness
            const alpha = charData.brightness;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            
            ctx.fillText(charData.char, this.x, charY);
        }
        
        // Reset global alpha
        ctx.globalAlpha = 1.0;
    }
    
    shouldRemove() {
        // Remove stream when the last character is off screen
        const lastCharY = this.y + (this.characters.length * CONFIG.FONT_SIZE);
        return lastCharY > canvas.height + CONFIG.FONT_SIZE;
    }
}

// Get a random character from the character set
function getRandomCharacter() {
    const chars = CHARACTERS.all;
    return chars[Math.floor(Math.random() * chars.length)];
}

// Generate a random integer between min and max (inclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Cross-browser requestAnimationFrame polyfill
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
               window.setTimeout(callback, 1000 / 60); // 60 FPS fallback
           };
})();