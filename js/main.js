/**
 * File: /js/main.js
 * Description: The main entry point for the application's JavaScript.
 * It imports other modules and initializes the app.
 */
import { initCanvas, getCanvasAsSVG, clearCanvas } from './canvas.js';
import { showClearConfirmModal, showLookupResultModal, hideAllModals } from './ui.js';
import { lookupShape } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- INITIALIZATION ---
    initCanvas();

    // --- DOM ELEMENT REFERENCES from the new control bar ---
    const clearBtn = document.getElementById('clear');
    const submitBtn = document.getElementById('submit');

    // --- EVENT LISTENERS ---
    
    clearBtn.addEventListener('click', () => {
        showClearConfirmModal(
            () => { // onConfirm
                clearCanvas();
                hideAllModals();
            },
            () => { // onCancel
                hideAllModals();
            }
        );
    });

    submitBtn.addEventListener('click', async () => {
        const svg = getCanvasAsSVG();
        if (!svg) {
            // This can be replaced with a more elegant UI notification
            alert("Please draw something first!");
            return;
        }

        // Show a temporary loading state in the modal
        showLookupResultModal({ isLoading: true });

        try {
            const result = await lookupShape(svg);
            // The ui.js module will now handle rendering the result in the new modal format
            showLookupResultModal(result);
        } catch (error) {
            console.error('Lookup failed:', error);
            showLookupResultModal({ error: 'Could not connect to the server.' });
        }
    });
});