// GameManager.js - Central coordinator for the Schelling simulation
import { Grid } from './Grid.js';
import { Agent } from './Agent.js';

export class GameManager {
    constructor() {
        this.grid = null;
        this.config = {
            gridSize: 20,
            cellSize: 30,
            K: 2, // Number of groups
            colors: ["#FF4136", "#0074D9"],
            groupSizes: [50, 50],
            tolerance: [0.3, 0.3],
            // Terrain configuration
            terrainThresholds: {
                water: 0.3,
                flatland: 0.7
            },
            noiseSeed: 12345
        };
        
        // Dragging state
        this.draggingAgent = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Event callbacks
        this.onConfigChangedCallback = null;
        this.onAgentMovedCallback = null;
    }

    /**
     * Initialize the simulation
     */
    initialize() {
        this.grid = new Grid(this.config.gridSize, this.config.cellSize);
        this.populateGrid();
        this.updateAllHappiness();
    }

    /**
     * Populate grid with agents according to group sizes (only on walkable tiles)
     */
    populateGrid() {
        // Get all walkable positions and shuffle them
        const walkablePositions = [];
        for (let row = 0; row < this.config.gridSize; row++) {
            for (let col = 0; col < this.config.gridSize; col++) {
                if (this.grid.isWalkable(row, col)) {
                    walkablePositions.push([row, col]);
                }
            }
        }
        
        // Shuffle positions
        this.shuffleArray(walkablePositions);

        // Place agents for each group
        let positionIndex = 0;
        for (let groupId = 0; groupId < this.config.K; groupId++) {
            const groupSize = this.config.groupSizes[groupId];
            const groupTolerance = this.config.tolerance[groupId];
            
            for (let i = 0; i < groupSize && positionIndex < walkablePositions.length; i++) {
                const [row, col] = walkablePositions[positionIndex];
                const agent = new Agent(groupId, groupTolerance);
                const success = this.grid.setAgent(row, col, agent);
                if (success) {
                    positionIndex++;
                } else {
                    // Skip this position if agent can't be placed
                    positionIndex++;
                    i--; // Try again with next position
                }
            }
        }
    }

    /**
     * Simple array shuffle implementation
     * @param {Array} array 
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Update happiness for all agents
     */
    updateAllHappiness() {
        const allAgents = this.grid.getAllAgents();
        
        allAgents.forEach(agent => {
            const neighbors = this.grid.getNeighbors(agent.row, agent.col);
            agent.calculateHappiness(neighbors);
        });
    }

    /**
     * Reset the simulation
     */
    resetSimulation() {
        this.initialize();
        if (this.onConfigChangedCallback) {
            this.onConfigChangedCallback();
        }
    }

    /**
     * Start dragging an agent
     * @param {number} row 
     * @param {number} col 
     * @param {number} mouseX 
     * @param {number} mouseY 
     * @returns {boolean} Success status
     */
    startDragging(row, col, mouseX, mouseY) {
        const agent = this.grid.getAgent(row, col);
        if (!agent) return false;

        this.draggingAgent = {
            agent: agent.clone(),
            originalRow: row,
            originalCol: col
        };

        // Calculate offset for smooth dragging
        this.dragOffset.x = mouseX - (col * this.config.cellSize + this.config.cellSize / 2);
        this.dragOffset.y = mouseY - (row * this.config.cellSize + this.config.cellSize / 2);

        // Remove agent from grid temporarily
        this.grid.setAgent(row, col, null);
        return true;
    }

    /**
     * Stop dragging and place agent
     * @param {number} mouseX 
     * @param {number} mouseY 
     * @returns {boolean} Success status
     */
    stopDragging(mouseX, mouseY) {
        if (!this.draggingAgent) return false;

        const targetRow = Math.floor(mouseY / this.config.cellSize);
        const targetCol = Math.floor(mouseX / this.config.cellSize);

        let placed = false;

        // Try to place in target cell
        if (this.grid.isValidPosition(targetRow, targetCol) && this.grid.isEmpty(targetRow, targetCol)) {
            this.grid.setAgent(targetRow, targetCol, this.draggingAgent.agent);
            placed = true;
        } else {
            // Return to original position
            this.grid.setAgent(this.draggingAgent.originalRow, this.draggingAgent.originalCol, this.draggingAgent.agent);
        }

        this.draggingAgent = null;
        this.updateAllHappiness();

        if (this.onAgentMovedCallback) {
            this.onAgentMovedCallback();
        }

        return placed;
    }

    /**
     * Get current dragging state
     * @returns {Object|null}
     */
    getDraggingState() {
        return this.draggingAgent;
    }

    /**
     * Get drag offset
     * @returns {Object}
     */
    getDragOffset() {
        return this.dragOffset;
    }

    /**
     * Calculate social welfare (sum of all happiness)
     * @returns {number}
     */
    calculateSocialWelfare() {
        const allAgents = this.grid.getAllAgents();
        return allAgents.reduce((total, agent) => total + agent.happiness, 0);
    }

    /**
     * Calculate average happiness
     * @returns {number}
     */
    calculateAverageHappiness() {
        const allAgents = this.grid.getAllAgents();
        if (allAgents.length === 0) return 0;
        
        const totalHappiness = allAgents.reduce((total, agent) => total + agent.happiness, 0);
        return totalHappiness / allAgents.length;
    }

    /**
     * Update configuration
     * @param {Object} newConfig 
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // Ensure arrays have correct length
        while (this.config.colors.length < this.config.K) {
            this.config.colors.push("#" + Math.floor(Math.random() * 16777215).toString(16));
        }
        while (this.config.groupSizes.length < this.config.K) {
            this.config.groupSizes.push(10);
        }
        while (this.config.tolerance.length < this.config.K) {
            this.config.tolerance.push(0.3);
        }

        if (this.onConfigChangedCallback) {
            this.onConfigChangedCallback();
        }
    }

    /**
     * Get configuration
     * @returns {Object}
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Check if total agents exceed walkable tile capacity
     * @returns {Object} {exceeds: boolean, totalAgents: number, capacity: number, terrainStats: Object}
     */
    checkCapacity() {
        const totalAgents = this.config.groupSizes.reduce((a, b) => a + b, 0);
        const terrainStats = this.grid ? this.grid.getTerrainStats() : { water: 0, flatland: 0, mountain: 0 };
        const walkableCapacity = terrainStats.flatland + terrainStats.mountain;
        
        return {
            exceeds: totalAgents >= walkableCapacity,
            totalAgents,
            capacity: walkableCapacity,
            totalCapacity: this.config.gridSize * this.config.gridSize,
            terrainStats
        };
    }

    /**
     * Update terrain configuration
     * @param {Object} terrainConfig New terrain settings
     */
    updateTerrainConfig(terrainConfig) {
        if (terrainConfig.thresholds) {
            this.config.terrainThresholds = { ...this.config.terrainThresholds, ...terrainConfig.thresholds };
            this.grid.updateTerrainThresholds(this.config.terrainThresholds);
        }
        
        if (terrainConfig.seed !== undefined) {
            this.config.noiseSeed = terrainConfig.seed;
            this.grid.setNoiseSeed(this.config.noiseSeed);
        }
        
        // Repopulate agents after terrain change
        this.populateGrid();
        this.updateAllHappiness();
        
        if (this.onConfigChangedCallback) {
            this.onConfigChangedCallback();
        }
    }

    /**
     * Get terrain statistics
     * @returns {Object} Terrain information
     */
    getTerrainStats() {
        return this.grid ? this.grid.getTerrainStats() : { water: 0, flatland: 0, mountain: 0 };
    }

    /**
     * Set event callback for configuration changes
     * @param {Function} callback 
     */
    onConfigChanged(callback) {
        this.onConfigChangedCallback = callback;
    }

    /**
     * Set event callback for agent moves
     * @param {Function} callback 
     */
    onAgentMoved(callback) {
        this.onAgentMovedCallback = callback;
    }

    /**
     * Get grid reference
     * @returns {Grid}
     */
    getGrid() {
        return this.grid;
    }
}