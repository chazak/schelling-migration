// Visualization.js - Handles all p5.js drawing operations
export class Visualization {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.canvas = null;
        this.hoverPosition = { row: -1, col: -1 };
    }

    /**
     * Setup the p5.js canvas
     */
    setup() {
        const config = this.gameManager.getConfig();
        this.canvas = createCanvas(config.gridSize * config.cellSize, config.gridSize * config.cellSize);
        this.canvas.parent("canvasContainer");
    }

    /**
     * Main drawing function called every frame
     */
    draw() {
        background(220);
        
        this.updateHoverPosition();
        this.drawGrid();
        this.drawDraggedAgent();
    }

    /**
     * Update hover position based on mouse
     */
    updateHoverPosition() {
        const config = this.gameManager.getConfig();
        this.hoverPosition.row = Math.floor(mouseY / config.cellSize);
        this.hoverPosition.col = Math.floor(mouseX / config.cellSize);
    }

    /**
     * Draw the grid with terrain and all agents
     */
    drawGrid() {
        const grid = this.gameManager.getGrid();
        const config = this.gameManager.getConfig();
        
        if (!grid) return;

        for (let row = 0; row < config.gridSize; row++) {
            for (let col = 0; col < config.gridSize; col++) {
                const x = col * config.cellSize;
                const y = row * config.cellSize;
                
                // Get tile for terrain info
                const tile = grid.getTile(row, col);
                
                // Draw terrain background
                stroke(0);
                strokeWeight(1);
                if (tile) {
                    fill(tile.getColor());
                } else {
                    fill(200); // Default gray
                }
                rect(x, y, config.cellSize, config.cellSize);
                
                // Draw agent if present
                const agent = grid.getAgent(row, col);
                if (agent && !this.isDraggingThisAgent(row, col)) {
                    this.drawAgent(agent, x, y, config.cellSize);
                }
            }
        }
    }

    /**
     * Draw an individual agent
     * @param {Agent} agent 
     * @param {number} x Screen x position
     * @param {number} y Screen y position
     * @param {number} cellSize Size of the cell
     */
    drawAgent(agent, x, y, cellSize) {
        const config = this.gameManager.getConfig();
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        
        // Draw agent circle
        fill(config.colors[agent.group]);
        stroke(0);
        strokeWeight(1);
        ellipse(centerX, centerY, cellSize * 0.8);
        
        // Highlight unhappy agents
        if (!agent.isHappy()) {
            stroke(255, 0, 0);
            strokeWeight(2);
            noFill();
            ellipse(centerX, centerY, cellSize * 0.9);
        }
    }

    /**
     * Draw the currently dragged agent
     */
    drawDraggedAgent() {
        const draggingState = this.gameManager.getDraggingState();
        if (!draggingState) return;

        const config = this.gameManager.getConfig();
        const dragOffset = this.gameManager.getDragOffset();
        
        fill(config.colors[draggingState.agent.group]);
        stroke(0);
        strokeWeight(1);
        ellipse(
            mouseX - dragOffset.x, 
            mouseY - dragOffset.y, 
            config.cellSize * 0.8
        );
    }

    /**
     * Check if we're currently dragging the agent at this position
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isDraggingThisAgent(row, col) {
        const draggingState = this.gameManager.getDraggingState();
        return draggingState && 
               draggingState.originalRow === row && 
               draggingState.originalCol === col;
    }

    /**
     * Handle mouse press events
     */
    handleMousePressed() {
        const config = this.gameManager.getConfig();
        const row = Math.floor(mouseY / config.cellSize);
        const col = Math.floor(mouseX / config.cellSize);
        
        if (this.isValidGridPosition(row, col)) {
            this.gameManager.startDragging(row, col, mouseX, mouseY);
        }
    }

    /**
     * Handle mouse release events
     */
    handleMouseReleased() {
        this.gameManager.stopDragging(mouseX, mouseY);
    }

    /**
     * Check if position is within grid bounds
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isValidGridPosition(row, col) {
        const config = this.gameManager.getConfig();
        return row >= 0 && row < config.gridSize && col >= 0 && col < config.gridSize;
    }

    /**
     * Get current hover information for tooltip
     * @returns {Object|null} Hover info or null
     */
    getHoverInfo() {
        if (!this.isValidGridPosition(this.hoverPosition.row, this.hoverPosition.col)) {
            return null;
        }

        const grid = this.gameManager.getGrid();
        const tile = grid.getTile(this.hoverPosition.row, this.hoverPosition.col);
        const agent = grid.getAgent(this.hoverPosition.row, this.hoverPosition.col);
        
        if (!tile) return null;

        return {
            tile,
            agent,
            row: this.hoverPosition.row,
            col: this.hoverPosition.col,
            mouseX,
            mouseY,
            happiness: agent ? agent.happiness : null,
            socialWelfare: this.gameManager.calculateSocialWelfare(),
            terrainType: tile.getName()
        };
    }

    /**
     * Resize canvas when grid size changes
     */
    resizeCanvas() {
        const config = this.gameManager.getConfig();
        resizeCanvas(config.gridSize * config.cellSize, config.gridSize * config.cellSize);
    }

    /**
     * Get canvas reference
     * @returns {p5.Renderer}
     */
    getCanvas() {
        return this.canvas;
    }
}