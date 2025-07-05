document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const canvasEl = document.getElementById('c');
    const toolbar = document.getElementById('toolbar');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // Modals
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const resultModal = document.getElementById('result-modal');
    const resultImage = document.getElementById('result-image');
    const similarityScoreEl = document.getElementById('similarity-score');
    const continueBtn = document.getElementById('continue-btn');
    const retryBtn = document.getElementById('retry-btn');

    let canvas; // To be initialized after sizing

    // --- Canvas Sizing ---
    const resizeCanvas = () => {
        const container = document.querySelector('.canvas-container');
        const { clientWidth, clientHeight } = container;
        canvasEl.width = clientWidth;
        canvasEl.height = clientHeight;
        if (canvas) {
            canvas.setWidth(clientWidth);
            canvas.setHeight(clientHeight);
            canvas.renderAll();
        }
    };
    
    // --- Fabric.js Initialization ---
    resizeCanvas(); // Set initial dimensions
    canvas = new fabric.Canvas('c', {
        isDrawingMode: true,
        backgroundColor: '#FFFFFF',
    });
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingBrush.width = 5;

    // --- State Management ---
    let history = [];
    let redoStack = [];
    let isProcessing = false;
    // Flag to prevent saving state during undo/redo operations
    let isReplaying = false;

    // --- Toolbar Visibility ---
    const showToolbar = () => toolbar.classList.add('visible');
    const hideToolbar = () => toolbar.classList.remove('visible');

    // --- History (Undo/Redo) Logic ---
    const saveState = () => {
        // Check the flag to avoid saving during a replay
        if (isReplaying) return;
        redoStack = []; // Clear redo stack on new action
        history.push(canvas.toJSON());
        updateHistoryButtons();
    };

    const updateHistoryButtons = () => {
        undoBtn.disabled = history.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    };

    const undo = () => {
        if (history.length > 0) {
            isReplaying = true;
            const currentState = history.pop();
            redoStack.push(currentState);
            
            const prevState = history.length > 0 ? history[history.length - 1] : {};

            canvas.loadFromJSON(prevState, () => {
                // Explicitly set background color to prevent it from being cleared on undo.
                canvas.setBackgroundColor('#FFFFFF', () => {
                    canvas.renderAll();
                    updateHistoryButtons();
                    isReplaying = false;
                });
            });
        }
    };

    const redo = () => {
        if (redoStack.length > 0) {
            isReplaying = true;
            const nextState = redoStack.pop();
            history.push(nextState);
            canvas.loadFromJSON(nextState, () => {
                // Explicitly set background color to maintain consistency.
                canvas.setBackgroundColor('#FFFFFF', () => {
                    canvas.renderAll();
                    updateHistoryButtons();
                    isReplaying = false;
                });
            });
        }
    };

    const resetCanvasState = () => {
        canvas.clear();
        history = [];
        redoStack = [];
        updateHistoryButtons();
        hideToolbar();
        canvas.on('path:created', onFirstDraw);
    };
    
    // --- Event Listeners ---
    const onFirstDraw = () => {
        showToolbar();
        canvas.off('path:created', onFirstDraw);
    };

    canvas.on('path:created', onFirstDraw);
    canvas.on('object:added', saveState);

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    
    clearBtn.addEventListener('click', () => confirmationModal.classList.remove('hidden'));

    submitBtn.addEventListener('click', async () => {
        if (isProcessing || canvas.getObjects().length === 0) return;
        
        isProcessing = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

        const pngDataUrl = canvas.toDataURL({ format: 'png' });
        
        console.log("--- Submitting Shape to /api/shapes/recognize ---");

        try {
            // --- MOCK API CALL ---
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockResult = {
                matchedShapeId: 'c1rc1e-uuid-001',
                similarityScore: 0.94,
                previewImageUrl: `https://placehold.co/192x192/ffffff/4B5563?text=Circle`
            };
            // --- END MOCK ---

            resultImage.src = mockResult.previewImageUrl;
            similarityScoreEl.textContent = `Similarity: ${(mockResult.similarityScore * 100).toFixed(0)}%`;
            resultModal.classList.remove('hidden');

        } catch (error) {
            console.error('Submission failed:', error);
            alert('Submission failed. See console for details.');
        } finally {
            isProcessing = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
        }
    });

    // Modal Listeners
    confirmYes.addEventListener('click', () => {
        resetCanvasState();
        confirmationModal.classList.add('hidden');
    });
    confirmNo.addEventListener('click', () => confirmationModal.classList.add('hidden'));

    continueBtn.addEventListener('click', () => resultModal.classList.add('hidden'));
    retryBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        resetCanvasState();
    });

    // Handle window resizing
    window.addEventListener('resize', resizeCanvas);
});
