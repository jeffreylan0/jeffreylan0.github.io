/**
 * File: /js/canvas.js
 * Description: Manages all logic for the Fabric.js canvas, including
 * drawing, history (undo/redo), and data extraction.
 */

// Module-level variables to hold canvas instance and history state.
let canvas;
let history = [];
let historyIndex = -1;

// Get references to UI elements this module controls.
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const submitBtnContainer = document.getElementById('submit-button-container');

/**
 * Updates the enabled/disabled state of undo/redo buttons based on history.
 */
const updateButtonStates = () => {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
};

/**
 * Saves the current canvas state to the history array for undo/redo functionality.
 */
const saveState = () => {
    // If we have undone and then draw again, clear the 'future' redo history.
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    // Add a deep copy of the canvas state.
    history.push(JSON.parse(JSON.stringify(canvas.toDatalessJSON())));
    historyIndex++;
    updateButtonStates();
};

/**
 * Initializes the Fabric.js canvas.
 * @returns {fabric.Canvas} The initialized canvas instance.
 */
export function initCanvas() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvasEl = document.getElementById('drawing-canvas');

    canvas = new fabric.Canvas(canvasEl, {
        isDrawingMode: true,
        backgroundColor: '#ffffff',
    });

    // Configure the drawing brush.
    canvas.freeDrawingBrush.color = '#1c1917'; // Near-black
    canvas.freeDrawingBrush.width = 3;

    // Function to resize canvas to fit its container.
    const resizeCanvas = () => {
        const { width, height } = canvasWrapper.getBoundingClientRect();
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
    };

    // Resize initially and on window resize.
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Save the initial empty state for the first "undo".
    saveState();

    // When a user finishes drawing a path, save the state.
    canvas.on('path:created', () => {
        // Show the submit button on the very first stroke.
        if (submitBtnContainer.classList.contains('hidden')) {
            submitBtnContainer.classList.remove('hidden');
        }
        saveState();
    });

    // Setup Undo/Redo button listeners.
    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            canvas.loadFromJSON(history[historyIndex], canvas.renderAll.bind(canvas));
            updateButtonStates();
        }
    });

    redoBtn.addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            canvas.loadFromJSON(history[historyIndex], canvas.renderAll.bind(canvas));
            updateButtonStates();
        }
    });

    return canvas;
}

/**
 * Exports the canvas content as an SVG string.
 * @returns {string|null} SVG string or null if canvas is empty.
 */
export function getCanvasAsSVG() {
    if (canvas.getObjects().length === 0) {
        return null;
    }
    return canvas.toSVG();
}

/**
 * Clears the canvas and resets the history.
 */
export function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff'; // Re-apply background after clear
    history = [];
    historyIndex = -1;
    saveState(); // Save the cleared state as the new initial state
    submitBtnContainer.classList.add('hidden'); // Hide submit button again
}
