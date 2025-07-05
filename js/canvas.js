/**
 * File: /js/canvas.js
 * Description: Manages all logic for the Fabric.js canvas. This version fixes
 * the multi-stroke drawing bug and correctly shows the controls.
 */

// Module-level variables
let canvas;
let history = [];
let historyIndex = -1;
let isActionInProgress = false; // Prevents re-triggering actions during undo/redo

// DOM element references
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const controlsContainer = document.getElementById('controls-container');

/**
 * Updates the enabled/disabled state of undo/redo buttons.
 */
const updateButtonStates = () => {
    // Undo is possible if we are not at the very first state.
    undoBtn.disabled = historyIndex <= 0;
    // Redo is possible if we are not at the most recent state.
    redoBtn.disabled = historyIndex >= history.length - 1;
};

/**
 * Saves the current canvas state to the history array.
 * This is the core of the undo/redo functionality.
 */
const saveState = () => {
    // If we have undone and then draw again, we must clear the 'future' history.
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toDatalessJSON());
    historyIndex++;
    updateButtonStates();
};

/**
 * Loads a specific state from history onto the canvas.
 * @param {number} index - The index of the history state to load.
 */
const loadState = (index) => {
    isActionInProgress = true; // Set a flag to ignore events during this load
    canvas.loadFromJSON(history[index], () => {
        canvas.renderAll();
        isActionInProgress = false; // Unset the flag once loading is complete
    });
    historyIndex = index;
    updateButtonStates();
};

/**
 * Initializes the Fabric.js canvas.
 */
export function initCanvas() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvasEl = document.getElementById('drawing-canvas');

    canvas = new fabric.Canvas(canvasEl, {
        isDrawingMode: true,
        backgroundColor: '#ffffff',
    });

    canvas.freeDrawingBrush.color = '#1c1917';
    canvas.freeDrawingBrush.width = 4; // Slightly thicker for better feel

    // Function to resize canvas to fit its container.
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

    // When a user finishes drawing a path, save the new state.
    canvas.on('path:created', () => {
        if (isActionInProgress) return; // Ignore if an undo/redo is happening
        
        // On the very first stroke, make the controls visible.
        if (!controlsContainer.classList.contains('visible')) {
            controlsContainer.classList.add('visible');
        }
        saveState();
    });

    // Undo Button Click
    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            loadState(historyIndex - 1);
        }
    });

    // Redo Button Click
    redoBtn.addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            loadState(historyIndex + 1);
        }
    });
}

/**
 * Exports the canvas content as an SVG string.
 * @returns {string|null} SVG string or null if canvas is empty.
 */
export function getCanvasAsSVG() {
    return canvas.getObjects().length > 0 ? canvas.toSVG() : null;
}

/**
 * Clears the canvas and resets the history.
 */
export function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    history = [];
    historyIndex = -1;
    saveState(); // Save the cleared state as the new initial state
    controlsContainer.classList.remove('visible'); // Hide controls again
}