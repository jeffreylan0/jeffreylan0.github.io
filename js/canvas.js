/**
 * File: /js/canvas.js
 * Description: A robust module for managing the Fabric.js canvas.
 * This version triggers the controls animation on the first mouse-down event.
 */

// Module-level variables
let canvas;
let history = [];
let historyIndex = -1;
let isFirstStroke = true; // Flag to track if the user has started drawing yet

// DOM element references
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const controlsContainer = document.getElementById('controls-container');

/**
 * Updates the enabled/disabled state of undo/redo buttons.
 */
const updateButtonStates = () => {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
};

/**
 * Saves the current canvas state for undo/redo.
 */
const saveState = () => {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toJSON());
    historyIndex++;
    updateButtonStates();
};

/**
 * Initializes the Fabric.js canvas and all its event listeners.
 */
export function initCanvas() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvasEl = document.getElementById('drawing-canvas');

    canvas = new fabric.Canvas(canvasEl, {
        isDrawingMode: true,
        backgroundColor: '#ffffff',
    });

    canvas.freeDrawingBrush.color = '#1c1917';
    canvas.freeDrawingBrush.width = 4;

    const resizeCanvas = () => {
        const { width, height } = canvasWrapper.getBoundingClientRect();
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Save the initial empty state.
    saveState();

    // --- EVENT LISTENERS ---

    // This event fires as soon as the user presses their mouse/finger down.
    canvas.on('mouse:down', () => {
        // If it's the very first stroke, show the controls.
        if (isFirstStroke) {
            controlsContainer.classList.add('visible');
            isFirstStroke = false; // Ensure this only happens once
        }
    });

    // This event fires *after* a drawing stroke is completed.
    canvas.on('path:created', () => {
        saveState();
    });

    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            canvas.loadFromJSON(history[historyIndex], () => {
                canvas.renderAll();
                canvas.isDrawingMode = true;
            });
            updateButtonStates();
        }
    });

    redoBtn.addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            canvas.loadFromJSON(history[historyIndex], () => {
                canvas.renderAll();
                canvas.isDrawingMode = true;
            });
            updateButtonStates();
        }
    });
}

/**
 * Exports the canvas content as an SVG string.
 */
export function getCanvasAsSVG() {
    return canvas.getObjects().length > 0 ? canvas.toSVG() : null;
}

/**
 * Clears the canvas and resets the entire state.
 */
export function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    history = [];
    historyIndex = -1;
    saveState();
    
    // Hide the controls and reset the first-stroke flag
    controlsContainer.classList.remove('visible');
    isFirstStroke = true;
}