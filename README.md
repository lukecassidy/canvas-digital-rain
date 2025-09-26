# Canvas Digital Rain

A HTML5 Canvas implementation of the iconic digital rain effect from The Matrix movies.

## Features

- **Matrix-style falling characters**: Uses Japanese Katakana and Latin characters for authentic look
- **Dynamic character streams**: Multiple columns of falling text with varying speeds and lengths
- **Fade effects**: Characters fade from bright green to darker shades as they fall
- **Responsive design**: Automatically adapts to browser window size
- **Smooth animation**: 60 FPS animation with requestAnimationFrame
- **Character morphing**: Characters randomly change as they fall for added visual interest

## Usage

Simply open `canvas.html` in your web browser to see the digital rain effect in action.

## Project Structure

```
canvas-digital-rain/
├── canvas.html          # Main HTML file with canvas element
├── js/
│   └── digital-rain.js  # JavaScript implementation of the effect
└── README.md           # This file
```

## Configuration

The effect can be customized by modifying the `CONFIG` object in `js/digital-rain.js`:

- `STREAM_SPAWN_PROBABILITY`: Controls how frequently new streams spawn
- `FONT_SIZE`: Size of the falling characters
- `STREAM_SPEED`: Speed of the falling effect
- `STREAM_MIN_LENGTH` / `STREAM_MAX_LENGTH`: Length range of character streams
- `CHARACTER_CHANGE_PROBABILITY`: How often characters morph while falling

## Live Demo

![Digital Rain Effect](https://github.com/user-attachments/assets/2db805f7-d8c2-4b79-83fe-d8cd30c5eb99)

*The classic Matrix digital rain effect running in the browser*