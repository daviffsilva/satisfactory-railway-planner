# Satisfactory Railway Planner

An interactive web-based railway network designer for the game Satisfactory. Plan, design, and validate your railway networks before building them in-game.

## ✨ Features (P1 MVP)

### Core Functionality
- **Interactive Canvas**: Pan and zoom to navigate your railway network
- **Track Creation**: Click-to-place nodes and automatically create straight track segments
- **Grid Snapping**: Configurable grid system with snapping for precise placement
- **Node Snapping**: Automatically connect to nearby nodes when placing tracks
- **Delete Tool**: Remove nodes and segments with a single click

### Validation System
- **Self-Intersection Detection**: Alerts when tracks cross without a shared node
- **Duplicate Segment Detection**: Prevents creating multiple tracks between the same nodes
- **Disconnected Network Info**: Informational alerts when 3+ independent networks exist (multiple networks are allowed)

### Project Management
- **Auto-Save**: Automatic saving to browser LocalStorage every 2 seconds
- **Export/Import**: Save and load projects as JSON files
- **Multiple Projects**: Manage multiple railway network designs

### User Interface
- **Tool Panel**: Easy access to all tools and settings
- **Issues Panel**: Real-time validation feedback with error, warning, and info categories
- **Project Stats**: Live tracking of nodes and segments
- **Save Status**: Visual indicator of last save time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

The development server will start at `http://localhost:3000`

## 📋 Usage

### Creating Your First Railway Network

1. **Start with Track Tool**: Select the Track tool from the left panel
2. **Place First Node**: Click anywhere on the canvas to place your first node
3. **Create Segments**: Click again to create a second node and automatically connect them with a track segment
4. **Continue Building**: Keep clicking to extend your network
5. **Grid Snapping**: Tracks automatically snap to the 8m grid for clean alignment
6. **Node Snapping**: When clicking near existing nodes, new tracks will connect automatically

### Tools

- **Select** (↖️): Select and manipulate elements (currently view-only)
- **Track** (━): Create nodes and track segments
- **Delete** (🗑️): Click nodes or tracks to remove them
- **Pan** (✋): Drag to move around the canvas

### Grid Settings

- **Show Grid**: Toggle grid visibility
- **Snap to Grid**: Enable/disable automatic snapping to 8m grid
- **Grid Size**: Default 8 meters (800 centimeters)

### Validation

The Issues Panel shows three types of feedback:

- **❌ Errors**: Problems that must be fixed (intersections, duplicates)
- **⚠️ Warnings**: Potential issues that should be reviewed
- **ℹ️ Information**: Helpful notifications (e.g., multiple independent networks)

### Coordinate System

- **Storage**: Centimeters (Satisfactory's native unit)
- **Display**: Meters (user-friendly)
- **Origin**: Satisfactory world origin (0,0,0)
- **Axis**: X-East, Y-North, Z-Up

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript 5.2
- **Build Tool**: Vite 5.0
- **State Management**: Custom reducer with Immer
- **Rendering**: HTML5 Canvas
- **Storage**: LocalStorage + JSON export
- **Deployment**: GitHub Pages

### Project Structure

```
src/
├── types/           # TypeScript type definitions
│   ├── railway.ts   # Core data model
│   └── state.ts     # Application state
├── state/           # State management
│   ├── reducer.ts   # Main reducer
│   └── actions.ts   # Action creators
├── utils/           # Pure utility functions
│   ├── coordinates.ts
│   ├── geometry.ts
│   ├── graph.ts
│   ├── validation.ts
│   ├── serialization.ts
│   ├── localStorage.ts
│   └── rendering.ts
├── components/      # React components
│   ├── RailwayMap.tsx
│   ├── ToolPanel.tsx
│   ├── IssuesPanel.tsx
│   └── ProjectManager.tsx
└── App.tsx          # Root component
```

## 🔧 Technical Details

### Key Implementation Features

1. **Immutable State Updates**: Using Immer for clean state management
2. **Real-time Validation**: Debounced validation (300ms) after each change
3. **Efficient Rendering**: Canvas-based rendering with viewport transforms
4. **Grid System**: 8-meter grid aligned with Satisfactory's foundation grid
5. **Snap Distance**: 4-meter radius for node snapping

### Performance Targets

- **Rendering**: 60 FPS for networks up to 1000 segments
- **Validation**: < 200ms for 1000 elements
- **Auto-save**: 2-second debounce, non-blocking

### Data Format

Projects are saved as JSON with the following structure:

```json
{
  "id": "uuid",
  "name": "Project Name",
  "schemaVersion": "1.0.0",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp",
  "nodes": [...],
  "segments": [...],
  "signals": [],
  "settings": {...}
}
```

## 📝 Recent Changes (P2 Fixes Applied to P1)

### Disconnected Networks
- **Changed**: Multiple independent railway networks are now explicitly allowed
- **Behavior**: Only shows informational message when 3+ networks exist
- **Severity**: Changed from 'warning' to 'info'
- **Rationale**: Players may intentionally create separate networks for different production areas

### Issue Severity Levels
- **Added**: New 'info' severity level for informational messages
- **UI**: Info messages shown separately with blue accent color (#6495ED)
- **Benefit**: Clear distinction between actual problems and helpful information

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- Geometry utilities (intersection detection)
- Graph utilities (connected components)
- Validation system
- Coordinate transformations

## 🚀 Deployment

The project is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions builds the project
3. Deploys to `https://<username>.github.io/satisfactory-railway-planner/`

Manual deployment:

```bash
npm run deploy
```

## 🔮 Upcoming Features (P2)

- **Signals**: Block and Path signal placement
- **Curved Tracks**: Bezier curve support for smooth curves
- **Undo/Redo**: Multi-level command history
- **Junction Management**: Advanced junction validation
- **Block Visualization**: Color-coded railway blocks

## 📄 License

This project is for educational and planning purposes. Satisfactory is developed and owned by Coffee Stain Studios.

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. All tests pass
2. Code follows TypeScript best practices
3. Components are properly typed
4. Commit messages are descriptive

## 📚 Additional Resources

- [Satisfactory Wiki - Railway](https://satisfactory.wiki.gg/wiki/Railway)
- [Technical Implementation Plan](./technical-implementation-plan.md)
- [P2 Changes Summary](./P2-CHANGES-SUMMARY.md)

---

**Built with ❤️ for the Satisfactory community**
