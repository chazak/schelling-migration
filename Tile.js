// Tile.js - Represents different terrain types in the grid
export class Tile {
    static TERRAIN_TYPES = {
        WATER: 0,
        FLATLAND: 1,
        MOUNTAIN: 2
    };

    static TERRAIN_NAMES = {
        0: 'Water',
        1: 'Flatland', 
        2: 'Mountain'
    };

    static TERRAIN_COLORS = {
        0: '#1E90FF', // Deep sky blue for water
        1: '#90EE90', // Light green for flatland
        2: '#8B4513'  // Saddle brown for mountains
    };

    constructor(terrainType) {
        this.terrainType = terrainType;
        this.agent = null; // Agent placed on this tile
    }

    /**
     * Check if agents can be placed on this tile
     * @returns {boolean}
     */
    isWalkable() {
        return this.terrainType !== Tile.TERRAIN_TYPES.WATER;
    }

    /**
     * Get the color for this terrain type
     * @returns {string} Hex color string
     */
    getColor() {
        return Tile.TERRAIN_COLORS[this.terrainType];
    }

    /**
     * Get the name for this terrain type
     * @returns {string}
     */
    getName() {
        return Tile.TERRAIN_NAMES[this.terrainType];
    }

    /**
     * Set agent on this tile
     * @param {Agent|null} agent 
     * @returns {boolean} Success status
     */
    setAgent(agent) {
        if (!this.isWalkable() && agent !== null) {
            return false; // Cannot place agent on water
        }
        this.agent = agent;
        return true;
    }

    /**
     * Get agent on this tile
     * @returns {Agent|null}
     */
    getAgent() {
        return this.agent;
    }

    /**
     * Check if tile has an agent
     * @returns {boolean}
     */
    hasAgent() {
        return this.agent !== null;
    }

    /**
     * Remove agent from this tile
     * @returns {Agent|null} The removed agent
     */
    removeAgent() {
        const agent = this.agent;
        this.agent = null;
        return agent;
    }

    /**
     * Create a copy of this tile
     * @returns {Tile}
     */
    clone() {
        const clone = new Tile(this.terrainType);
        if (this.agent) {
            clone.agent = this.agent.clone();
        }
        return clone;
    }

    /**
     * Get terrain type from elevation using thresholds
     * @param {number} elevation Value between 0 and 1
     * @param {Object} thresholds {water: number, flatland: number}
     * @returns {number} Terrain type
     */
    static getTerrainFromElevation(elevation, thresholds) {
        if (elevation < thresholds.water) {
            return Tile.TERRAIN_TYPES.WATER;
        } else if (elevation < thresholds.flatland) {
            return Tile.TERRAIN_TYPES.FLATLAND;
        } else {
            return Tile.TERRAIN_TYPES.MOUNTAIN;
        }
    }
}