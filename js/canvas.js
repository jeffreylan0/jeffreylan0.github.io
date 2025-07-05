/**
 * File: /js/canvas.js
 * Description: A completely overhauled and robust module for managing the Fabric.js canvas.
 * This version uses a self-removing event listener to guarantee the controls appear reliably on the first stroke.
 */

// Module-level variables
let canvas;
let history = [];
let historyIndex = -1;

// --- Helper Functions ---

/**
 * Updates the enabled/disabled state of undo/redo buttons.
 */
const updateButtonStates = () => {
    // Query for elements each time to be safe, though they should be constant.
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
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
 * Defines the function that will run ONCE when the user first draws.
 * It makes the controls visible and then removes itself to prevent re-running.
 */
const onFirstStroke = () => {
    const controlsContainer = document.getElementById('controls-container');
    controlsContainer.classList.add('visible');
    
    // IMPORTANT: Remove this specific listener so it never fires again for this session.
    canvas.off('mouse:down', onFirstStroke);
};

// --- Exported Functions ---

/**
 * Initializes the Fabric.js canvas and all its event listeners.
 */
export function initCanvas() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvasEl = document.getElementById('drawing-canvas');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');

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

    // Attach the one-time listener for the first drawing action.
    canvas.on('mouse:down', onFirstStroke);

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
 * Clears the canvas and resets the entire state, including the first-stroke trigger.
 */
export function clearCanvas() {
    const controlsContainer = document.getElementById('controls-container');

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    history = [];
    historyIndex = -1;
    saveState();
    
    // Hide the controls.
    controlsContainer.classList.remove('visible');
    
    // Re-attach the one-time listener for the next drawing session.
    // This ensures that if a user clears the canvas, the animation will happen again on their next "first" stroke.
    canvas.on('mouse:down', onFirstStroke);
}
