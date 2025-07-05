/**
 * File: /js/api.js
 * Description: Handles all fetch requests to the backend API.
 */

// The base URL for your backend server.
// Change this if your backend is running on a different port or domain.
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Sends the user's drawing to the backend for lookup.
 * @param {string} svg - The SVG data of the drawing.
 * @returns {Promise<object>} A promise that resolves to the JSON response from the server.
 */
export async function lookupShape(svg) {
    const response = await fetch(`${API_BASE_URL}/shapes/lookup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ svg }),
    });

    if (!response.ok) {
        // If the server response is not OK, throw an error.
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

// --- Future API functions would go here ---

// export async function login(username, password) { ... }
// export async function getDashboardData(token) { ... }
// export async function updateShapeSettings(shapeId, settings, token) { ... }
