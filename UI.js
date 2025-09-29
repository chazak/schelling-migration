// UI.js - Handles all DOM interactions and user interface
export class UI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.elements = {};
        this.tooltipDiv = null;
        
        // Bind methods to preserve context
        this.updateMetrics = this.updateMetrics.bind(this);
        this.handleTooltip = this.handleTooltip.bind(this);
    }

    /**
     * Initialize all UI controls
     */
    setupControls() {
        console.log("UI setupControls started");
        
        try {
            this.initializeElements();
            console.log("Elements initialized");
            
            this.createDynamicElements();
            console.log("Dynamic elements created");
            
            this.setupEventListeners();
            console.log("Event listeners setup");
            
            this.renderGroupControls();
            console.log("Group controls rendered");
            
            // Try simple terrain controls first
            this.renderSimpleTerrainControls();
            console.log("Simple terrain controls rendered");
            
            // Then try full terrain controls
            this.renderTerrainControls();
            console.log("Terrain controls rendered");
            
            // Set up event callbacks
            this.gameManager.onConfigChanged(this.updateMetrics);
            this.gameManager.onAgentMoved(this.updateMetrics);
            console.log("UI setupControls completed");
        } catch (error) {
            console.error("Error in setupControls:", error);
        }
    }

    /**
     * Get references to existing DOM elements
     */
    initializeElements() {
        this.elements = {
            numGroupsSlider: document.getElementById("numGroups"),
            numGroupsLabel: document.getElementById("numGroupsLabel"),
            gridSizeSlider: document.getElementById("gridSize"),
            gridSizeLabel: document.getElementById("gridSizeLabel"),
            resetButton: document.getElementById("resetGrid"),
            colorPickersDiv: document.getElementById("colorPickers"),
            happinessDisplay: document.getElementById("happiness"),
            welfareDisplay: document.getElementById("welfare"),
            controlsDiv: document.getElementById("controls")
        };

        this.tooltipDiv = document.getElementById("tooltip");
    }

    /**
     * Create dynamic DOM elements
     */
    createDynamicElements() {
        // Warning div for capacity issues
        this.elements.warningDiv = document.createElement("p");
        this.elements.warningDiv.id = "warning";
        this.elements.warningDiv.style.color = "red";
        this.elements.controlsDiv.appendChild(this.elements.warningDiv);

        // Terrain controls container
        this.elements.terrainControlsDiv = document.createElement("div");
        this.elements.terrainControlsDiv.id = "terrainControls";
        const terrainTitle = document.createElement("h3");
        terrainTitle.innerText = "Terrain Settings";
        this.elements.terrainControlsDiv.appendChild(terrainTitle);
        this.elements.controlsDiv.appendChild(this.elements.terrainControlsDiv);

        // Group controls container
        this.elements.groupControlsDiv = document.createElement("div");
        this.elements.groupControlsDiv.id = "groupControls";
        this.elements.controlsDiv.appendChild(this.elements.groupControlsDiv);
    }

    /**
     * Setup event listeners for controls
     */
    setupEventListeners() {
        // Number of groups slider
        this.elements.numGroupsSlider.oninput = (e) => {
            const newK = parseInt(e.target.value);
            this.elements.numGroupsLabel.innerText = newK;
            
            const config = this.gameManager.getConfig();
            this.gameManager.updateConfig({ K: newK });
            this.renderGroupControls();
            this.gameManager.resetSimulation();
        };

        // Grid size slider
        this.elements.gridSizeSlider.oninput = (e) => {
            const newGridSize = parseInt(e.target.value);
            this.elements.gridSizeLabel.innerText = newGridSize;
            
            this.gameManager.updateConfig({ gridSize: newGridSize });
            this.gameManager.resetSimulation();
        };

        // Reset button
        this.elements.resetButton.onclick = () => {
            this.gameManager.resetSimulation();
        };
    }

    /**
     * Render controls for each group (colors, sizes, tolerance)
     */
    renderGroupControls() {
        const config = this.gameManager.getConfig();
        
        // Clear existing controls
        this.elements.colorPickersDiv.innerHTML = "";
        this.elements.groupControlsDiv.innerHTML = "";

        for (let groupId = 0; groupId < config.K; groupId++) {
            this.createGroupColorControl(groupId, config);
            this.createGroupSizeControl(groupId, config);
            this.createGroupToleranceControl(groupId, config);
        }

        this.checkCapacityWarning();
    }

    /**
     * Create color picker for a group
     * @param {number} groupId 
     * @param {Object} config 
     */
    createGroupColorControl(groupId, config) {
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = config.colors[groupId] || this.generateRandomColor();
        colorInput.title = `Group ${groupId} Color`;
        
        colorInput.oninput = (e) => {
            const newColors = [...config.colors];
            newColors[groupId] = e.target.value;
            this.gameManager.updateConfig({ colors: newColors });
        };
        
        this.elements.colorPickersDiv.appendChild(colorInput);
    }

    /**
     * Create agent count control for a group
     * @param {number} groupId 
     * @param {Object} config 
     */
    createGroupSizeControl(groupId, config) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";

        const label = document.createElement("label");
        label.innerText = `Group ${groupId} agents: `;
        label.style.display = "block";

        const sizeInput = document.createElement("input");
        sizeInput.type = "number";
        sizeInput.min = 0;
        sizeInput.max = config.gridSize * config.gridSize;
        sizeInput.value = config.groupSizes[groupId] || 10;
        sizeInput.style.width = "60px";
        
        sizeInput.oninput = (e) => {
            const newGroupSizes = [...config.groupSizes];
            newGroupSizes[groupId] = parseInt(e.target.value) || 0;
            this.gameManager.updateConfig({ groupSizes: newGroupSizes });
            this.checkCapacityWarning();
        };

        container.appendChild(label);
        container.appendChild(sizeInput);
        this.elements.groupControlsDiv.appendChild(container);
    }

    /**
     * Create tolerance control for a group
     * @param {number} groupId 
     * @param {Object} config 
     */
    createGroupToleranceControl(groupId, config) {
        const container = document.createElement("div");
        container.style.marginBottom = "15px";

        const label = document.createElement("label");
        label.innerText = `Group ${groupId} tolerance: `;
        label.style.display = "block";

        const toleranceInput = document.createElement("input");
        toleranceInput.type = "range";
        toleranceInput.min = 0;
        toleranceInput.max = 1;
        toleranceInput.step = 0.05;
        toleranceInput.value = config.tolerance[groupId];
        toleranceInput.style.width = "150px";

        const valueDisplay = document.createElement("span");
        valueDisplay.innerText = ` ${config.tolerance[groupId]}`;
        valueDisplay.style.marginLeft = "10px";
        
        toleranceInput.oninput = (e) => {
            const newTolerance = [...config.tolerance];
            newTolerance[groupId] = parseFloat(e.target.value);
            this.gameManager.updateConfig({ tolerance: newTolerance });
            valueDisplay.innerText = ` ${e.target.value}`;
            
            // Update agent tolerances and recalculate happiness
            this.updateAgentTolerances();
        };

        container.appendChild(label);
        container.appendChild(toleranceInput);
        container.appendChild(valueDisplay);
        this.elements.groupControlsDiv.appendChild(container);
    }

    /**
     * Update tolerance for existing agents
     */
    updateAgentTolerances() {
        const grid = this.gameManager.getGrid();
        const config = this.gameManager.getConfig();
        
        if (!grid) return;

        const allAgents = grid.getAllAgents();
        allAgents.forEach(agent => {
            agent.tolerance = config.tolerance[agent.group];
        });

        this.gameManager.updateAllHappiness();
    }

    /**
     * Generate a random hex color
     * @returns {string}
     */
    generateRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    /**
     * Render terrain controls
     */
    renderTerrainControls() {
        console.log("renderTerrainControls called");
        const config = this.gameManager.getConfig();
        console.log("Config retrieved:", config);
        
        if (!this.elements.terrainControlsDiv) {
            console.error("terrainControlsDiv not found!");
            return;
        }
        
        // Clear existing terrain controls (keep title)
        const title = this.elements.terrainControlsDiv.firstChild;
        this.elements.terrainControlsDiv.innerHTML = "";
        if (title) {
            this.elements.terrainControlsDiv.appendChild(title);
        } else {
            console.log("No title found, creating new one");
            const newTitle = document.createElement("h3");
            newTitle.innerText = "Terrain Settings";
            this.elements.terrainControlsDiv.appendChild(newTitle);
        }

        // Water threshold control
        this.createTerrainThresholdControl("water", "Water Threshold", config.terrainThresholds.water);
        
        // Flatland threshold control  
        this.createTerrainThresholdControl("flatland", "Flatland Threshold", config.terrainThresholds.flatland);
        
        // Noise seed control
        this.createNoiseSeedControl(config.noiseSeed);
        
        // Terrain statistics display
        this.createTerrainStatsDisplay();
    }

    /**
     * Create terrain threshold control
     * @param {string} type Threshold type (water/flatland)
     * @param {string} label Display label
     * @param {number} value Current value
     */
    createTerrainThresholdControl(type, label, value) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";

        const labelElem = document.createElement("label");
        labelElem.innerText = `${label}: `;
        labelElem.style.display = "block";

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 0.1;
        slider.max = 0.9;
        slider.step = 0.05;
        slider.value = value;
        slider.style.width = "150px";

        const valueDisplay = document.createElement("span");
        valueDisplay.innerText = ` ${value}`;
        valueDisplay.style.marginLeft = "10px";
        
        slider.oninput = (e) => {
            const newValue = parseFloat(e.target.value);
            valueDisplay.innerText = ` ${newValue}`;
            
            const newThresholds = {};
            newThresholds[type] = newValue;
            this.gameManager.updateTerrainConfig({ thresholds: newThresholds });
        };

        container.appendChild(labelElem);
        container.appendChild(slider);
        container.appendChild(valueDisplay);
        this.elements.terrainControlsDiv.appendChild(container);
    }

    /**
     * Create noise seed control
     * @param {number} currentSeed Current seed value
     */
    createNoiseSeedControl(currentSeed) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";

        const label = document.createElement("label");
        label.innerText = "Noise Seed: ";
        label.style.display = "block";

        const seedInput = document.createElement("input");
        seedInput.type = "number";
        seedInput.value = currentSeed;
        seedInput.style.width = "80px";
        
        const randomButton = document.createElement("button");
        randomButton.innerText = "Random";
        randomButton.style.marginLeft = "5px";
        
        seedInput.oninput = (e) => {
            const newSeed = parseInt(e.target.value) || 12345;
            this.gameManager.updateTerrainConfig({ seed: newSeed });
        };
        
        randomButton.onclick = () => {
            const randomSeed = Math.floor(Math.random() * 1000000);
            seedInput.value = randomSeed;
            this.gameManager.updateTerrainConfig({ seed: randomSeed });
        };

        container.appendChild(label);
        container.appendChild(seedInput);
        container.appendChild(randomButton);
        this.elements.terrainControlsDiv.appendChild(container);
    }

    /**
     * Create terrain statistics display
     */
    createTerrainStatsDisplay() {
        const container = document.createElement("div");
        container.style.marginBottom = "15px";
        container.style.fontSize = "12px";

        const title = document.createElement("p");
        title.innerText = "Terrain Distribution:";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "5px";

        this.elements.terrainStatsDiv = document.createElement("div");
        
        container.appendChild(title);
        container.appendChild(this.elements.terrainStatsDiv);
        this.elements.terrainControlsDiv.appendChild(container);
        
        this.updateTerrainStats();
    }

    /**
     * Update terrain statistics display
     */
    updateTerrainStats() {
        if (!this.elements.terrainStatsDiv) return;
        
        const stats = this.gameManager.getTerrainStats();
        const total = stats.water + stats.flatland + stats.mountain;
        
        this.elements.terrainStatsDiv.innerHTML = `
            <div style="color: #1E90FF;">Water: ${stats.water} (${((stats.water/total)*100).toFixed(1)}%)</div>
            <div style="color: #90EE90;">Flatland: ${stats.flatland} (${((stats.flatland/total)*100).toFixed(1)}%)</div>
            <div style="color: #8B4513;">Mountain: ${stats.mountain} (${((stats.mountain/total)*100).toFixed(1)}%)</div>
            <div style="margin-top: 5px; font-weight: bold;">Walkable: ${stats.flatland + stats.mountain} tiles</div>
        `;
    }

    /**
     * Check and display capacity warning
     */
    checkCapacityWarning() {
        const capacityInfo = this.gameManager.checkCapacity();
        
        if (capacityInfo.exceeds) {
            this.elements.warningDiv.innerText = 
                `⚠️ Total agents (${capacityInfo.totalAgents}) exceed walkable capacity (${capacityInfo.capacity}). Some agents will not fit.`;
        } else {
            this.elements.warningDiv.innerText = "";
        }
    }

    /**
     * Update metrics display
     */
    updateMetrics() {
        const avgHappiness = this.gameManager.calculateAverageHappiness();
        const socialWelfare = this.gameManager.calculateSocialWelfare();
        
        this.elements.happinessDisplay.innerText = `Average Happiness: ${avgHappiness.toFixed(2)}`;
        this.elements.welfareDisplay.innerText = `Social Welfare: ${socialWelfare.toFixed(2)}`;
        
        this.checkCapacityWarning();
        this.updateTerrainStats();
    }

    /**
     * Handle tooltip display
     * @param {Object|null} hoverInfo 
     */
    handleTooltip(hoverInfo) {
        if (!hoverInfo || !this.tooltipDiv) {
            this.hideTooltip();
            return;
        }

        const { tile, agent, mouseX, mouseY, happiness, socialWelfare, terrainType } = hoverInfo;
        
        this.tooltipDiv.style.display = "block";
        this.tooltipDiv.style.left = (mouseX + 630) + "px";
        this.tooltipDiv.style.top = (mouseY + 80) + "px";
        
        let tooltipContent = `Terrain: ${terrainType}<br>`;
        
        if (agent) {
            tooltipContent += `
                Group: ${agent.group}<br>
                Happiness: ${happiness.toFixed(2)}<br>
            `;
        } else {
            tooltipContent += tile.isWalkable() ? "Empty (walkable)<br>" : "Water (not walkable)<br>";
        }
        
        tooltipContent += `Social Welfare: ${socialWelfare.toFixed(2)}`;
        
        this.tooltipDiv.innerHTML = tooltipContent;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltipDiv) {
            this.tooltipDiv.style.display = "none";
        }
    }

    /**
     * Update canvas size in response to grid size changes
     */
    onCanvasResize() {
        // This will be called by the visualization when canvas resizes
        // Can add any UI adjustments needed when canvas size changes
    }

    /**
     * Simple test method to add terrain controls
     */
    renderSimpleTerrainControls() {
        console.log("renderSimpleTerrainControls called");
        
        if (!this.elements.terrainControlsDiv) {
            console.error("terrainControlsDiv not found in renderSimpleTerrainControls");
            return;
        }
        
        // Just add a simple test button
        const testButton = document.createElement("button");
        testButton.innerText = "Test Terrain";
        testButton.onclick = () => {
            console.log("Test terrain button clicked!");
            alert("Terrain system is working!");
        };
        
        this.elements.terrainControlsDiv.appendChild(testButton);
        console.log("Simple terrain control added");
    }

    /**
     * Get tooltip div reference
     * @returns {HTMLElement}
     */
    getTooltipDiv() {
        return this.tooltipDiv;
    }
}