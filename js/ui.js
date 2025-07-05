/**
 * File: /js/ui.js
 * Description: Manages showing, hiding, and dynamically updating UI elements,
 * primarily the modals. This version renders matched shapes in a canvas.
 */

// Get references to the modal elements.
const confirmClearModal = document.getElementById('confirm-clear-modal');
const lookupResultModal = document.getElementById('lookup-result-modal');
let thumbnailCanvas = null; // To hold the Fabric instance for the modal's canvas

/**
 * Hides all modals on the page.
 */
export function hideAllModals() {
    confirmClearModal.classList.add('hidden');
    lookupResultModal.classList.add('hidden');
}

/**
 * Shows the "Confirm Clear" modal.
 * @param {function} onConfirm - Callback function to run when user confirms.
 * @param {function} onCancel - Callback function to run when user cancels.
 */
export function showClearConfirmModal(onConfirm, onCancel) {
    hideAllModals();
    confirmClearModal.classList.remove('hidden');
    document.getElementById('confirm-clear-btn').onclick = onConfirm;
    document.getElementById('cancel-clear-btn').onclick = onCancel;
}

/**
 * Initializes the small canvas inside the result modal.
 */
function initThumbnailCanvas() {
    if (thumbnailCanvas) {
        thumbnailCanvas.dispose(); // Clean up previous instance
    }
    thumbnailCanvas = new fabric.Canvas('thumbnail-canvas', {
        interactive: false, // Make it non-drawable, just for viewing
        backgroundColor: '#f5f5f4', // stone-100
    });
}

/**
 * Shows the lookup result modal and populates it with data from the API.
 * @param {object} result - The result object from the API call.
 */
export function showLookupResultModal(result) {
    hideAllModals();
    
    // Get modal elements
    const modalBody = document.getElementById('lookup-body');
    const modalActions = document.getElementById('lookup-actions');

    // Clear previous dynamic content
    modalBody.innerHTML = `<div class="w-full h-64 bg-stone-50 rounded-md border border-stone-200"><canvas id="thumbnail-canvas"></canvas></div>`;
    modalActions.innerHTML = '';

    // --- Render modal content based on API response ---
    if (result.isLoading) {
        modalBody.innerHTML = `<div class="w-full h-64 flex items-center justify-center text-stone-500">Searching...</div>`;
    } else if (result.error || !result.match_found) {
        const message = result.error ? result.error : "This shape hasn't been registered yet.";
        modalBody.innerHTML = `<div class="w-full h-64 flex items-center justify-center text-center p-4">${message}</div>`;
        modalActions.innerHTML = `<button id="retry-btn" class="modal-button-secondary w-32">Retry</button>`;
    } else { // Match was found
        // Initialize the canvas inside the modal
        initThumbnailCanvas();
        const { shape } = result;

        // Load the matched SVG into the thumbnail canvas
        fabric.loadSVGFromString(shape.thumbnail_svg, (objects, options) => {
            const obj = fabric.util.groupSVGElements(objects, options);
            obj.scaleToWidth(thumbnailCanvas.width * 0.8); // Scale to fit with padding
            obj.scaleToHeight(thumbnailCanvas.height * 0.8);
            thumbnailCanvas.centerObject(obj);
            thumbnailCanvas.add(obj);
            thumbnailCanvas.renderAll();
        });

        // Set up buttons
        modalActions.innerHTML = `
            <button id="retry-btn" class="modal-button-secondary w-32">Retry</button>
            <button id="open-btn" class="modal-button-primary w-32">Open</button>
        `;
        
        // Add logic for the "Open" button
        const openBtn = modalActions.querySelector('#open-btn');
        if(openBtn) {
            openBtn.onclick = () => {
                console.log(`Redirecting to view shape with ID: ${result.shape.id}`);
                // window.location.href = `/view-shape?id=${result.shape.id}`;
            };
        }
    }

    // Add event listener for the retry button
    const retryBtn = modalActions.querySelector('#retry-btn');
    if (retryBtn) {
        retryBtn.onclick = hideAllModals;
    }
    
    // Show the fully constructed modal
    lookupResultModal.classList.remove('hidden');
}