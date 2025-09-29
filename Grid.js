// Grid.js - Manages the spatial grid and agent placement with terrain
import { Agent } from './Agent.js';
import { Tile } from './Tile.js';
import { NoiseGenerator } from './NoiseGenerator.js';

export class Grid {
    constructor(size, cellSize) {
        this.size = size;
        this.cellSize = cellSize;
        this.tiles = [];
        this.noiseGenerator = new NoiseGenerator();
        this.terrainThresholds = {
            water: 0.3,
            flatland: 0.7
        };
        this.initialize();
    }

    /**
     * Initialize grid with terrain and empty tiles
     */
    initialize() {
        this.generateTerrain();
    }

    /**
     * Generate terrain using noise
     */
    generateTerrain() {
        try {
            console.log("Generating terrain...");
            const terrainMap = this.noiseGenerator.generateTerrainMap(
                this.size, 
                this.size, 
                this.terrainThresholds
            );
            console.log("Terrain map generated");
            
            this.tiles = [];
            for (let row = 0; row < this.size; row++) {
                this.tiles[row] = [];
                for (let col = 0; col < this.size; col++) {
                    this.tiles[row][col] = new Tile(terrainMap[row][col]);
                }
            }
            console.log("Tiles created successfully");
        } catch (error) {
            console.error("Error generating terrain:", error);
            // Fallback: create all flatland tiles
            this.tiles = [];
            for (let row = 0; row < this.size; row++) {
                this.tiles[row] = [];
                for (let col = 0; col < this.size; col++) {
                    this.tiles[row][col] = new Tile(1); // All flatland
                }
            }
            console.log("Fallback: Created all flatland tiles");
        }
    }

    /**
     * Get tile at specific position
     * @param {number} row 
     * @param {number} col 
     * @returns {Tile|null} Tile at position or null
     */
    getTile(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.tiles[row][col];
    }

    /**
     * Get agent at specific position
     * @param {number} row 
     * @param {number} col 
     * @returns {Agent|null} Agent at position or null
     */
    getAgent(row, col) {
        const tile = this.getTile(row, col);
        return tile ? tile.getAgent() : null;
    }

    /**
     * Set agent at specific position
     * @param {number} row 
     * @param {number} col 
     * @param {Agent|null} agent 
     */
    setAgent(row, col, agent) {
        const tile = this.getTile(row, col);
        if (!tile) return false;
        
        const success = tile.setAgent(agent);
        if (success && agent) {
            agent.setPosition(row, col);
        }
        return success;
    }

    /**
     * Check if position is valid
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    /**
     * Check if cell is empty and walkable
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isEmpty(row, col) {
        const tile = this.getTile(row, col);
        return tile && tile.isWalkable() && !tile.hasAgent();
    }

    /**
     * Check if tile is walkable (not water)
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isWalkable(row, col) {
        const tile = this.getTile(row, col);
        return tile ? tile.isWalkable() : false;
    }

    /**
     * Get all neighboring agents (including empty cells as null)
     * @param {number} row 
     * @param {number} col 
     * @returns {Array} Array of neighboring agents or null
     */
    getNeighbors(row, col) {
        const neighbors = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // Skip center cell
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidPosition(newRow, newCol)) {
                    neighbors.push(this.getAgent(newRow, newCol));
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Get neighbor positions (coordinates)
     * @param {number} row 
     * @param {number} col 
     * @returns {Array} Array of [row, col] coordinates
     */
    getNeighborPositions(row, col) {
        const positions = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidPosition(newRow, newCol)) {
                    positions.push([newRow, newCol]);
                }
            }
        }
        
        return positions;
    }

    /**
     * Get all agents in the grid
     * @returns {Array} Array of all agents
     */
    getAllAgents() {
        const allAgents = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const agent = this.getAgent(row, col);
                if (agent) {
                    allAgents.push(agent);
                }
            }
        }
        
        return allAgents;
    }

    /**
     * Get all empty cell positions (walkable and no agent)
     * @returns {Array} Array of [row, col] coordinates
     */
    getEmptyCells() {
        const emptyCells = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.isEmpty(row, col)) {
                    emptyCells.push([row, col]);
                }
            }
        }
        
        return emptyCells;
    }

    /**
     * Get terrain statistics
     * @returns {Object} Terrain type counts
     */
    getTerrainStats() {
        const stats = { water: 0, flatland: 0, mountain: 0 };
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.getTile(row, col);
                if (tile) {
                    switch (tile.terrainType) {
                        case Tile.TERRAIN_TYPES.WATER: stats.water++; break;
                        case Tile.TERRAIN_TYPES.FLATLAND: stats.flatland++; break;
                        case Tile.TERRAIN_TYPES.MOUNTAIN: stats.mountain++; break;
                    }
                }
            }
        }
        
        return stats;
    }

    /**
     * Update terrain thresholds and regenerate terrain
     * @param {Object} thresholds New threshold values
     */
    updateTerrainThresholds(thresholds) {
        this.terrainThresholds = { ...this.terrainThresholds, ...thresholds };
        
        // Store current agents
        const agents = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const agent = this.getAgent(row, col);
                if (agent) {
                    agents.push({ agent, row, col });
                }
            }
        }
        
        // Regenerate terrain
        this.generateTerrain();
        
        // Try to replace agents on walkable tiles
        for (const { agent, row, col } of agents) {
            if (this.isEmpty(row, col)) {
                this.setAgent(row, col, agent);
            } else {
                // Find nearest empty walkable tile
                const emptyCell = this.getRandomEmptyCell();
                if (emptyCell) {
                    this.setAgent(emptyCell[0], emptyCell[1], agent);
                }
            }
        }
    }

    /**
     * Set noise generator seed
     * @param {number} seed New seed value
     */
    setNoiseSeed(seed) {
        this.noiseGenerator.setSeed(seed);
        this.updateTerrainThresholds({}); // Regenerate with same thresholds
    }

    /**
     * Get random empty cell position
     * @returns {Array|null} [row, col] or null if no empty cells
     */
    getRandomEmptyCell() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }

    /**
     * Move agent from one position to another
     * @param {number} fromRow 
     * @param {number} fromCol 
     * @param {number} toRow 
     * @param {number} toCol 
     * @returns {boolean} Success status
     */
    moveAgent(fromRow, fromCol, toRow, toCol) {
        const agent = this.getAgent(fromRow, fromCol);
        if (!agent || !this.isEmpty(toRow, toCol)) return false;
        
        this.setAgent(fromRow, fromCol, null);
        this.setAgent(toRow, toCol, agent);
        return true;
    }

    /**
     * Get total number of agents
     * @returns {number}
     */
    getTotalAgents() {
        return this.getAllAgents().length;
    }

    /**
     * Get total capacity of the grid
     * @returns {number}
     */
    getTotalCapacity() {
        return this.size * this.size;
    }
}