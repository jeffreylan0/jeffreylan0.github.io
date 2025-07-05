/**
 * File: /js/ui.js
 * Description: Manages showing, hiding, and dynamically updating UI elements,
 * primarily the modals.
 */

// Get references to the modal elements.
const confirmClearModal = document.getElementById('confirm-clear-modal');
const lookupResultModal = document.getElementById('lookup-result-modal');

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
    // Assign the callback functions to the button clicks.
    document.getElementById('confirm-clear-btn').onclick = onConfirm;
    document.getElementById('cancel-clear-btn').onclick = onCancel;
}

/**
 * Shows the lookup result modal and populates it with data from the API.
 * @param {object} result - The result object from the API call.
 */
export function showLookupResultModal(result) {
    hideAllModals();
    const titleEl = document.getElementById('lookup-title');
    const bodyEl = document.getElementById('lookup-body');
    const actionsEl = document.getElementById('lookup-actions');

    // Clear previous dynamic content.
    bodyEl.innerHTML = '';
    actionsEl.innerHTML = '';

    // --- Render modal content based on API response ---
    if (result.isLoading) {
        titleEl.textContent = 'Searching...';
        bodyEl.innerHTML = `<p class="modal-text">Comparing your drawing to registered shapes...</p>`;
    } else if (result.error) {
        titleEl.textContent = 'Error';
        bodyEl.innerHTML = `<p class="modal-text text-red-500">${result.error}</p>`;
        actionsEl.innerHTML = `<button id="retry-btn" class="modal-button-secondary">Close</button>`;
    } else if (!result.match_found) {
        titleEl.textContent = 'Unique Shape!';
        bodyEl.innerHTML = `<p class="modal-text">This shape hasn't been registered yet. You could be the first!</p>`;
        actionsEl.innerHTML = `
            <button id="retry-btn" class="modal-button-secondary">Retry</button>
            <button class="modal-button-primary">Register</button>
        `;
    } else { // Match was found
        const { shape } = result;
        titleEl.textContent = 'Shape Found';
        bodyEl.innerHTML = `
            <p class="modal-text">Your drawing matches this registered shape:</p>
            <div class="thumbnail-preview">${shape.thumbnail_svg}</div>
        `;

        if (shape.is_locked) {
            bodyEl.innerHTML += `<p class="modal-text mt-4 font-semibold text-orange-600">This shape is temporarily locked by its owner.</p>`;
            actionsEl.innerHTML = `<button id="retry-btn" class="modal-button-secondary">Retry</button>`;
        } else if (shape.is_password_protected) {
            bodyEl.innerHTML += `
                <div class="mt-4">
                    <label for="shape-password" class="block text-sm font-medium text-stone-700 text-left">This shape is password protected.</label>
                    <input type="password" id="shape-password" class="password-input mt-1" placeholder="Enter password">
                </div>
            `;
            actionsEl.innerHTML = `
                <button id="retry-btn" class="modal-button-secondary">Retry</button>
                <button id="unlock-btn" class="modal-button-primary">Unlock</button>
            `;
        } else {
            actionsEl.innerHTML = `
                <button id="retry-btn" class="modal-button-secondary">Retry</button>
                <button id="open-btn" class="modal-button-primary">Open</button>
            `;
        }
    }

    // Add event listener for the retry button, which is almost always present.
    const retryBtn = actionsEl.querySelector('#retry-btn');
    if (retryBtn) {
        retryBtn.onclick = hideAllModals;
    }
    
    // Add logic for the "Open" button if it exists.
    const openBtn = actionsEl.querySelector('#open-btn');
    if(openBtn) {
        openBtn.onclick = () => {
            // In a real app, this would redirect to the shape's public page.
            console.log(`Redirecting to view shape with ID: ${result.shape.id}`);
            // window.location.href = `/view-shape?id=${result.shape.id}`;
        };
    }

    // Show the fully constructed modal.
    lookupResultModal.classList.remove('hidden');
}
