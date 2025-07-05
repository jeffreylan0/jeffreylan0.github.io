/**
 * File: /js/canvas.js
 * Description: A completely rewritten and robust module for managing the Fabric.js canvas.
 * FIX 2 & 3: This version correctly handles multi-stroke drawing and the appearance of the controls.
 */

// Module-level variables
let canvas;
let history = [];
let historyIndex = -1;

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
 * Saves the current canvas state. This is the core of the undo/redo logic.
 */
const saveState = () => {
    // If we have undone, and then draw again, we must clear the 'future' redo history.
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toJSON()); // Use toJSON for a complete state snapshot
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

    // This event fires *after* a drawing stroke is completed.
    canvas.on('path:created', () => {
        // On the very first stroke (when history has only the initial empty state), show the controls.
        if (history.length === 1) {
            controlsContainer.classList.add('visible');
        }
        // Save the new state of the canvas after the stroke is added.
        saveState();
    });

    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            canvas.loadFromJSON(history[historyIndex], () => {
                canvas.renderAll();
                // We must re-enable drawing mode after loading a state.
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