window.addEventListener('load', () => {
    // --- DOM Element Selection ---
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const toolbar = document.getElementById('toolbar');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    // --- State Management ---
    let isDrawing = false;
    let toolbarVisible = false;
    let history = []; 
    let currentPath = [];
    let historyIndex = -1;

    // --- Canvas Setup ---
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        redrawCanvas();
    }

    function setCanvasStyle() {
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    // --- Drawing Event Handlers ---
    function getEventCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const { x, y } = getEventCoords(e);
        currentPath = [{ x, y }];
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getEventCoords(e);
        currentPath.push({ x, y });
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.closePath();

        if (currentPath.length > 1) {
            if (historyIndex < history.length - 1) {
                history = history.slice(0, historyIndex + 1);
            }
            history.push(currentPath);
            historyIndex++;
            updateButtonStates();
        }
        currentPath = [];

        // Show the toolbar if it's the first stroke (or first after a clear)
        if (!toolbarVisible && history.length > 0) {
            toolbarVisible = true;
            toolbar.classList.remove('-translate-y-full');
        }
    }

    // --- History and Canvas Redrawing ---
    function redrawCanvas() {
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasStyle();
        
        // Redraw all paths from history up to the current state
        for (let i = 0; i <= historyIndex; i++) {
            const path = history[i];
            if (!path || path.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let j = 1; j < path.length; j++) {
                ctx.lineTo(path[j].x, path[j].y);
            }
            ctx.stroke();
        }
    }

    // --- Button Logic ---
    function updateButtonStates() {
        undoBtn.disabled = historyIndex < 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
        const isEmpty = history.length === 0;
        clearBtn.disabled = isEmpty;
        submitBtn.disabled = isEmpty;
    }

    function undo() {
        if (historyIndex >= 0) {
            historyIndex--;
            redrawCanvas();
            updateButtonStates();
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            redrawCanvas();
            updateButtonStates();
        }
    }

    function clearCanvas() {
        history = [];
        historyIndex = -1;
        redrawCanvas();
        updateButtonStates();
        hideModal();

        // Hide the toolbar when the canvas is cleared
        if (toolbarVisible) {
            toolbar.classList.add('-translate-y-full');
            toolbarVisible = false;
        }
    }

    function submitDrawing() {
        if (history.length === 0) {
            console.log("Canvas is empty. Nothing to submit.");
            return;
        }
        
        // This is the data you would send to the backend.
        // It's an array of strokes, where each stroke is an array of {x, y} points.
        const drawingData = JSON.stringify(history.slice(0, historyIndex + 1));
        console.log("Submitting drawing data to backend (simulation):");
        console.log(drawingData);
        
        // For now, just show an alert.
        alert("Drawing data logged to the console. This would normally be sent to a server.");
    }

    // --- Modal Logic ---
    function showModal() {
        confirmModal.classList.remove('hidden');
    }
    function hideModal() {
        confirmModal.classList.add('hidden');
    }

    // --- Initial Setup and Event Listeners ---
    resizeCanvas();
    updateButtonStates();

    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Use { passive: false } to allow preventDefault() in touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    clearBtn.addEventListener('click', showModal);
    submitBtn.addEventListener('click', submitDrawing);

    confirmYesBtn.addEventListener('click', clearCanvas);
    confirmNoBtn.addEventListener('click', hideModal);
});
