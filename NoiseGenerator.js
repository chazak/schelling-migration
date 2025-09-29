// NoiseGenerator.js - Generates terrain using noise functions
export class NoiseGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
        this.perm = new Array(512);
        this.permMod12 = new Array(512);
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        this.initializePermutations();
    }

    /**
     * Initialize permutation tables with seed
     */
    initializePermutations() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // Seed-based shuffle
        let seed = this.seed;
        for (let i = 255; i > 0; i--) {
            seed = (seed * 9301 + 49297) % 233280;
            const j = Math.floor((seed / 233280) * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Fill permutation arrays
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }

    /**
     * Dot product of gradient and distance vectors
     */
    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    /**
     * 2D Simplex noise implementation
     * @param {number} xin X coordinate
     * @param {number} yin Y coordinate
     * @returns {number} Noise value between -1 and 1
     */
    simplex2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        
        let n0, n1, n2;
        
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        
        let i1, j1;
        if (x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }
        
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;
        
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.permMod12[ii + this.perm[jj]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
        const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
        
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }
        
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }
        
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }
        
        return 70.0 * (n0 + n1 + n2);
    }

    /**
     * Generate normalized noise (0 to 1)
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @returns {number} Noise value between 0 and 1
     */
    noise(x, y) {
        return (this.simplex2D(x, y) + 1) / 2;
    }

    /**
     * Generate fractal noise with multiple octaves
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @param {Array} octaves Array of {frequency, amplitude} objects
     * @returns {number} Combined noise value
     */
    fractalNoise(x, y, octaves) {
        let value = 0;
        let maxValue = 0;
        
        for (const octave of octaves) {
            value += this.noise(x * octave.frequency, y * octave.frequency) * octave.amplitude;
            maxValue += octave.amplitude;
        }
        
        return value / maxValue; // Normalize to 0-1
    }

    /**
     * Generate terrain elevation map
     * @param {number} width Grid width
     * @param {number} height Grid height
     * @param {Object} config Configuration object
     * @returns {Array} 2D array of elevation values
     */
    generateElevationMap(width, height, config = {}) {
        const {
            octaves = [
                { frequency: 1, amplitude: 1.0 },
                { frequency: 2, amplitude: 0.5 },
                { frequency: 4, amplitude: 0.25 },
                { frequency: 8, amplitude: 0.125 }
            ],
            exponent = 2.0,
            scale = 1.0
        } = config;

        const elevationMap = [];
        
        for (let y = 0; y < height; y++) {
            elevationMap[y] = [];
            for (let x = 0; x < width; x++) {
                // Normalize coordinates to -0.5 to 0.5 range
                const nx = (x / width - 0.5) * scale;
                const ny = (y / height - 0.5) * scale;
                
                // Generate fractal noise
                let elevation = this.fractalNoise(nx, ny, octaves);
                
                // Apply redistribution function (power curve)
                elevation = Math.pow(elevation, exponent);
                
                elevationMap[y][x] = Math.max(0, Math.min(1, elevation));
            }
        }
        
        return elevationMap;
    }

    /**
     * Generate terrain map with different terrain types
     * @param {number} width Grid width
     * @param {number} height Grid height
     * @param {Object} thresholds Terrain thresholds
     * @param {Object} config Noise configuration
     * @returns {Array} 2D array of terrain type indices
     */
    generateTerrainMap(width, height, thresholds, config = {}) {
        const elevationMap = this.generateElevationMap(width, height, config);
        const terrainMap = [];
        
        for (let y = 0; y < height; y++) {
            terrainMap[y] = [];
            for (let x = 0; x < width; x++) {
                const elevation = elevationMap[y][x];
                
                if (elevation < thresholds.water) {
                    terrainMap[y][x] = 0; // Water
                } else if (elevation < thresholds.flatland) {
                    terrainMap[y][x] = 1; // Flatland
                } else {
                    terrainMap[y][x] = 2; // Mountain
                }
            }
        }
        
        return terrainMap;
    }

    /**
     * Set new seed and regenerate permutations
     * @param {number} seed New seed value
     */
    setSeed(seed) {
        this.seed = seed;
        this.initializePermutations();
    }
}