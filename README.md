# Schelling Segregation Simulation

An interactive agent-based model implementing Thomas Schelling's famous segregation model with procedural terrain generation.

## Features

### 🎮 Interactive Simulation
- **Agent-based modeling** - Simulate social segregation dynamics
- **Drag & drop agents** - Interactive repositioning of agents
- **Real-time metrics** - Track happiness and social welfare
- **Multiple groups** - Support for 2-5 different agent groups

### 🌍 Procedural Terrain
- **Three terrain types** - Water, Flatland, and Mountain
- **Noise-based generation** - Realistic terrain patterns
- **Customizable thresholds** - Control terrain distribution
- **Seed control** - Reproducible terrain generation

### 🎨 Modern Interface
- **Dark theme** - Professional, eye-friendly design
- **Responsive layout** - Clean three-panel interface
- **Bulma CSS framework** - Modern, consistent styling
- **Interactive controls** - Smooth sliders and hover effects

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/schelling-migration.git
   cd schelling-migration
   ```

2. **Start a local server** (required for ES6 modules)
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000/index.html
   ```

## How to Use

### Basic Workflow
1. **Adjust group settings** - Set number of groups, sizes, and colors
2. **Configure terrain** - Set water/flatland thresholds and seed
3. **Generate terrain** - Click "Generate Terrain" to create the map
4. **Populate agents** - Click "Populate Agents" to place agents
5. **Observe dynamics** - Watch segregation patterns emerge

### Advanced Features
- **Custom seeds** - Enter specific seeds for reproducible terrain
- **Group properties** - Individual tolerance settings per group
- **Interactive editing** - Drag agents to different locations
- **Real-time stats** - Monitor average happiness and social welfare

## Architecture

### Files Structure
- `index.html` - Main application with dark theme UI
- `style.css` - Bulma-enhanced styling
- `simple-terrain.html` - Fallback version without ES6 modules
- ES6 Modules:
  - `Agent.js` - Agent class and behavior
  - `Grid.js` - Grid management and terrain
  - `GameManager.js` - Central coordination
  - `Visualization.js` - Rendering logic
  - `UI.js` - User interface controls
  - `NoiseGenerator.js` - Terrain generation

### Design Patterns
- **Unity-style architecture** - GameManager coordinates all systems
- **ES6 modules** - Clean separation of concerns
- **Observer pattern** - Real-time UI updates
- **Strategy pattern** - Configurable agent behaviors

## Technical Details

### Technologies Used
- **Vanilla JavaScript** - No heavy frameworks required
- **p5.js** - Canvas rendering and interaction
- **Bulma CSS** - Modern UI framework
- **ES6 modules** - Clean code organization
- **CSS Grid/Flexbox** - Responsive layout

### Browser Requirements
- Modern browser with ES6 module support
- Local server required (CORS restrictions)
- Recommended: Chrome, Firefox, Safari, Edge

## Research Applications

This simulation is useful for:
- **Social science research** - Understanding segregation dynamics
- **Urban planning** - Modeling neighborhood formation
- **Agent-based modeling education** - Teaching simulation concepts
- **Policy analysis** - Testing intervention strategies

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.