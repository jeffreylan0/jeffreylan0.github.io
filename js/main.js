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
    // Initialize the canvas and get a reference to it.
    const canvas = initCanvas();

    // --- DOM ELEMENT REFERENCES ---
    const clearBtn = document.getElementById('clear');
    const submitBtn = document.getElementById('submit');

    // --- EVENT LISTENERS ---
    
    // When the user clicks the 'Clear' button
    clearBtn.addEventListener('click', () => {
        // Show the confirmation modal. Pass callback functions for confirm/cancel.
        showClearConfirmModal(
            () => { // onConfirm action
                clearCanvas();
                hideAllModals();
            },
            () => { // onCancel action
                hideAllModals();
            }
        );
    });

    // When the user clicks the 'Submit' arrow button
    submitBtn.addEventListener('click', async () => {
        const svg = getCanvasAsSVG();
        if (!svg) {
            // In a real app, show a more elegant message than an alert.
            alert("Please draw something first!");
            return;
        }

        // Show a temporary loading state in the modal while we fetch from the backend.
        showLookupResultModal({ isLoading: true });

        try {
            // Call the API to check the shape.
            const result = await lookupShape(svg);
            // Display the results from the API call.
            showLookupResultModal(result);
        } catch (error) {
            console.error('Lookup failed:', error);
            // Show an error message if the API call fails.
            showLookupResultModal({ error: 'Could not connect to the server.' });
        }
    });
});
