// Agent.js - Represents individual agents in the Schelling model
export class Agent {
    constructor(group, tolerance = 0.3) {
        this.group = group;
        this.tolerance = tolerance;
        this.happiness = 0;
        this.row = -1;
        this.col = -1;
    }

    /**
     * Calculate happiness based on neighbors of the same group
     * @param {Array} neighbors - Array of neighbor agents
     * @returns {number} Happiness value between 0 and 1
     */
    calculateHappiness(neighbors) {
        if (neighbors.length === 0) return 1.0;
        
        const sameGroupNeighbors = neighbors.filter(neighbor => 
            neighbor !== null && neighbor.group === this.group
        ).length;
        
        this.happiness = sameGroupNeighbors / neighbors.length;
        return this.happiness;
    }

    /**
     * Check if agent is happy based on tolerance threshold
     * @returns {boolean} True if agent is happy
     */
    isHappy() {
        return this.happiness >= this.tolerance;
    }

    /**
     * Set the position of the agent in the grid
     * @param {number} row 
     * @param {number} col 
     */
    setPosition(row, col) {
        this.row = row;
        this.col = col;
    }

    /**
     * Create a copy of this agent
     * @returns {Agent} New agent instance
     */
    clone() {
        const clone = new Agent(this.group, this.tolerance);
        clone.happiness = this.happiness;
        clone.row = this.row;
        clone.col = this.col;
        return clone;
    }
}