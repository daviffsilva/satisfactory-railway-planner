# Satisfactory Railway Planner

An interactive web-based railway planning tool for the game Satisfactory. Design your railway networks with tracks, block signals, and path signals before building them in-game.

## Features

- **Interactive Map**: Click and drag to place railway tracks on a grid-based map
- **Signal System**: Place block signals (blue) and path signals (green) to control train traffic
- **Grid Snapping**: All elements snap to a grid for precise placement
- **Save/Load**: Export your designs as JSON files and load them later
- **Satisfactory Styling**: UI inspired by the game's aesthetic

## How to Use

1. **Select a Tool**: Choose from the tool panel on the left
   - **Select**: Click and drag to select multiple items
   - **Track**: Click and drag to place railway tracks
   - **Block Signal**: Click on tracks to place block signals (blue)
   - **Path Signal**: Click on tracks to place path signals (green)
   - **Delete**: Click on items to remove them

2. **Design Your Railway**: Use the tools to create your railway network

3. **Save Your Work**: Click "Save Design" to download your railway as a JSON file

4. **Load Previous Designs**: Click "Load Design" to import previously saved railways

## Development

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

1. Update the `homepage` field in `package.json` with your GitHub username
2. Run the deployment command:

```bash
npm run deploy
```

## Technical Details

- Built with React 18 and TypeScript
- Canvas-based rendering for smooth graphics
- Grid-based coordinate system for precise placement
- JSON-based save/load system
- Responsive design optimized for desktop use

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own Satisfactory planning needs.

