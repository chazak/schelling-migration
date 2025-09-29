// main.js - Entry point that coordinates all modules
import { GameManager } from './GameManager.js';
import { Visualization } from './Visualization.js';
import { UI } from './UI.js';
import { Tile } from './Tile.js';
import { NoiseGenerator } from './NoiseGenerator.js';

// Global instances
let gameManager;
let visualization;
let ui;

// Debug logging function
function debugLog(message) {
    console.log(message);
    const debugLogDiv = document.getElementById('debugLog');
    if (debugLogDiv) {
        debugLogDiv.innerHTML += message + '<br>';
        debugLogDiv.scrollTop = debugLogDiv.scrollHeight;
    }
}

/**
 * p5.js setup function - called once at start
 */
window.setup = function() {
    debugLog("Starting setup...");
    
    try {
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
            debugLog("DOM not ready, waiting...");
            setTimeout(window.setup, 100);
            return;
        }
        
        // Initialize all systems
        gameManager = new GameManager();
        debugLog("GameManager created");
        
        visualization = new Visualization(gameManager);
        debugLog("Visualization created");
        
        ui = new UI(gameManager);
        debugLog("UI created");
        
        // Setup each system
        visualization.setup();
        debugLog("Visualization setup complete");
        
        ui.setupControls();
        debugLog("UI setup complete");
        
        gameManager.initialize();
        debugLog("GameManager initialized");
        
        // Initial metrics update
        ui.updateMetrics();
        debugLog("Metrics updated");
        
        debugLog("Schelling Model initialized with terrain!");
    } catch (error) {
        debugLog("ERROR: " + error.message);
        debugLog("Stack: " + error.stack);
    }
};

/**
 * p5.js draw function - called every frame
 */
window.draw = function() {
    // Main drawing
    visualization.draw();
    
    // Handle tooltip
    const hoverInfo = visualization.getHoverInfo();
    ui.handleTooltip(hoverInfo);
    
    // Update metrics display
    ui.updateMetrics();
};

/**
 * p5.js mouse pressed handler
 */
window.mousePressed = function() {
    visualization.handleMousePressed();
};

/**
 * p5.js mouse released handler
 */
window.mouseReleased = function() {
    visualization.handleMouseReleased();
};

/**
 * Handle window resize
 */
window.windowResized = function() {
    visualization.resizeCanvas();
    ui.onCanvasResize();
};

// Export for debugging/development
window.gameManager = gameManager;
window.visualization = visualization;
window.ui = ui;