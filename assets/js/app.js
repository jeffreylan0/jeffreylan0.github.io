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
    
    // history stores an array of paths. Each path is an array of points {x, y}.
    let history = []; 
    // currentPath stores the points for the stroke currently being drawn.
    let currentPath = [];
    // historyIndex points to the current state in the history array.
    let historyIndex = -1;

    // --- Canvas Setup ---
    function resizeCanvas() {
        // To avoid blurry lines on high-DPI screens, we scale the canvas resolution
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Redraw content after resizing
        redrawCanvas();
    }

    function setCanvasStyle() {
        ctx.strokeStyle = '#212121'; // Near-black color
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    // Initial setup
    resizeCanvas();
    setCanvasStyle();
    updateButtonStates();

    // --- Drawing Event Handlers ---
    function getEventCoords(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const { x, y } = getEventCoords(e);
        
        // Start a new path for the new stroke
        currentPath = [{ x, y }];
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getEventCoords(e);
        
        // Add point to the current path and draw a line to it
        currentPath.push({ x, y });
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.closePath();

        // If the path has more than one point, save it to history
        if (currentPath.length > 1) {
            // When a new stroke is drawn after undoing, we clear the "redo" history
            if (historyIndex < history.length - 1) {
                history = history.slice(0, historyIndex + 1);
            }
            history.push(currentPath);
            historyIndex++;
            updateButtonStates();
        }
        currentPath = [];

        // Show the toolbar if it's the first stroke
        if (!toolbarVisible) {
            toolbarVisible = true;
            toolbar.classList.remove('-translate-y-20', 'opacity-0');
        }
    }

    // --- History and Canvas Redrawing ---
    function redrawCanvas() {
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set drawing styles again as clearRect might reset them
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
        // Disable/enable undo button
        undoBtn.disabled = historyIndex < 0;
        // Disable/enable redo button
        redoBtn.disabled = historyIndex >= history.length - 1;
        // Disable clear and submit if canvas is empty
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
    }

    function submitDrawing() {
        if (history.length === 0) {
            console.log("Canvas is empty. Nothing to submit.");
            return;
        }
        
        // --- BACKEND INTEGRATION POINT ---
        // 1. NORMALIZE THE DATA:
        //    Before sending, the `history` data (an array of strokes, which are arrays of points)
        //    should be normalized. This makes shape comparison robust.
        //    - Find bounding box of the entire drawing.
        //    - Translate all points so the top-left of the box is at (0,0).
        //    - Scale all points so the drawing fits within a standard size (e.g., 256x256).
        //    - Optionally, simplify the paths (e.g., using Ramer-Douglas-Peucker algorithm)
        //      to reduce the number of points while preserving the shape.
        
        // 2. SERIALIZE:
        //    Convert the normalized data to a JSON string.
        const drawingData = JSON.stringify(history.slice(0, historyIndex + 1));
        console.log("Submitting drawing data...");
        console.log(drawingData);

        // 3. SEND TO BACKEND:
        //    Use the fetch API to send this data to your server endpoint.
        //    fetch('/api/submit-shape', {
        //        method: 'POST',
        //        headers: { 'Content-Type': 'application/json' },
        //        body: drawingData
        //    }).then(response => response.json())
        //      .then(data => console.log('Server response:', data))
        //      .catch(error => console.error('Error submitting shape:', error));
        
        alert("Drawing data logged to console. See comments for backend integration details.");
    }

    // --- Modal Logic ---
    function showModal() {
        confirmModal.classList.remove('hidden');
    }
    function hideModal() {
        confirmModal.classList.add('hidden');
    }


    // --- Event Listeners ---
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    window.addEventListener('resize', resizeCanvas);

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    clearBtn.addEventListener('click', showModal);
    submitBtn.addEventListener('click', submitDrawing);

    confirmYesBtn.addEventListener('click', clearCanvas);
    confirmNoBtn.addEventListener('click', hideModal);
});
