/**
 * File: /js/canvas.js
 * Description: A corrected and robust module for managing the Fabric.js canvas.
 * This version uses a simple flag combined with corrected CSS to reliably reveal the controls.
 */

// Module-level variables
let canvas;
let history = [];
let historyIndex = -1;
let hasUserDrawn = false; // Simple, reliable flag to track the first interaction.

// DOM element references
const controlsContainer = document.getElementById('controls-container');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');

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
        // If the user has not drawn yet, show the controls.
        if (!hasUserDrawn) {
            controlsContainer.classList.add('visible');
            hasUserDrawn = true; // Set the flag to true so this only runs once per session.
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
    
    // Hide the controls and reset the flag for the next drawing session.
    controlsContainer.classList.remove('visible');
    hasUserDrawn = false;
}
