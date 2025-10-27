# Satisfactory Railway Planner - User Stories (Prioritized for Development)

**Document Version:** 1.0  
**Created:** 2025-10-27  
**For:** Code Lead Technical Refinement  

---

## **PRIORITY 1: Core MVP (Must Have)**
*Foundation features required for basic functionality*

### **1.1 - Interactive World Map** 
**Epic:** Map Visualization  
**Story ID:** US-MAP-001  
**Priority:** P1 - Critical  

> As a Satisfactory player, I want to view the game's world map as a background layer so that I can plan my railway network with accurate spatial reference to the game world.

**Acceptance Criteria:**
- [ ] Satisfactory world map displays as non-editable background layer
- [ ] Map supports pan and zoom functionality with smooth inertial movement
- [ ] Coordinate system aligns with canonical Satisfactory coordinates
- [ ] Map coordinates display in both map space and model space
- [ ] Grid overlay with toggle functionality available
- [ ] Grid snapping can be enabled/disabled
- [ ] Snapping to existing nodes can be configured independently
- [ ] Map renders at non-root paths (e.g., `/rail-planner/`) for GitHub Pages compatibility
- [ ] Works offline after initial load

**Technical Notes for Code Lead:**
- Requires background map asset integration
- Canvas/SVG rendering decision needed
- Coordinate system transformation logic
- Performance considerations for large map rendering

---

### **1.2 - Track Creation**
**Epic:** Track Design  
**Story ID:** US-TRACK-001  
**Priority:** P1 - Critical  

> As a Satisfactory player, I want to draw railway tracks between points so that I can design my network layout.

**Acceptance Criteria:**
- [ ] Draw tracks as polylines between nodes using Track tool
- [ ] Support both straight and curved segments with control points
- [ ] Create, move, and delete nodes with visual drag handles
- [ ] Create, move, and delete segments with visual feedback
- [ ] Prevent self-intersections at non-nodes or flag as errors
- [ ] Prevent duplicate coincident segments or flag as errors
- [ ] All track editing actions support undo/redo functionality
- [ ] Track creation is keyboard accessible
- [ ] React TypeScript implementation

**Technical Notes for Code Lead:**
- Core data model definition required
- Canvas interaction system design
- Geometry validation algorithms
- State management architecture decision

---

### **1.3 - Project Persistence**
**Epic:** Project Management  
**Story ID:** US-PROJ-001  
**Priority:** P1 - Critical  

> As a Satisfactory player, I want to save my railway designs locally so that I can continue working on them across sessions.

**Acceptance Criteria:**
- [ ] Autosave to Local Storage on every significant edit
- [ ] "Save As" functionality with user-defined project names
- [ ] Autosave never blocks user input; failures surface non-modally
- [ ] Project metadata includes: id, name, createdAt, updatedAt, schemaVersion
- [ ] Settings persist per browser via Local Storage
- [ ] Multiple projects can be stored locally

**Technical Notes for Code Lead:**
- Local Storage management strategy
- Autosave debouncing/throttling
- Error handling for storage failures
- Data serialization format

---

### **1.4 - Basic Network Validation**
**Epic:** Error Detection  
**Story ID:** US-ERROR-001  
**Priority:** P1 - Critical  

> As a Satisfactory player, I want the system to detect basic design errors in my railway network so that I can fix critical issues.

**Acceptance Criteria:**
- [ ] Detect orphaned track not connected to main graph
- [ ] Identify self-intersections at non-nodes
- [ ] Flag duplicate coincident segments
- [ ] Validation runs in real-time during edits
- [ ] Basic error display on map with markers
- [ ] Performance: validation completes within 200ms for 10k elements

**Technical Notes for Code Lead:**
- Graph analysis algorithms needed
- Real-time validation performance optimization
- Error state management
- Visual error indication system

---

## **PRIORITY 2: Essential Features (Should Have)**
*Key functionality that differentiates the product*

### **2.1 - Signal Placement**
**Epic:** Signaling and Block System  
**Story ID:** US-SIGNAL-001  
**Priority:** P2 - High  

> As a Satisfactory player, I want to place railway signals on track segments so that I can control train movement and create safe blocks.

**Acceptance Criteria:**
- [ ] Place signals on segments using Signal tool
- [ ] Signal orientations: one-way A→B, one-way B→A, or bidirectional
- [ ] Visual representation shows signal direction clearly
- [ ] Prevent overlapping signals on same segment within tolerance
- [ ] Detect conflicting signal directions and flag as errors
- [ ] Signal placement supports undo/redo
- [ ] Signals included in JSON export/import

**Technical Notes for Code Lead:**
- Signal data model and relationships
- Segment-based positioning system (offsetT)
- Collision detection for signal overlap
- Visual rendering of directional indicators

---

### **2.2 - Block Visualization**
**Epic:** Signaling and Block System  
**Story ID:** US-BLOCK-001  
**Priority:** P2 - High  

> As a Satisfactory player, I want to see how my signals divide the track into blocks so that I can understand train movement constraints.

**Acceptance Criteria:**
- [ ] Block View toggle that colors each block uniquely
- [ ] Block boundaries clearly outlined when Block View enabled
- [ ] System computes blocks by splitting track at signals and junctions
- [ ] Block metadata displayed: ID, length, connected blocks, signals
- [ ] Block legend showing color coding
- [ ] Block computation completes within 200ms for 10k elements
- [ ] Blocks recalculated in real-time on track/signal changes

**Technical Notes for Code Lead:**
- Block computation algorithm (graph segmentation)
- Color palette management for unique block colors
- Performance optimization for large networks
- Block metadata calculation and storage

---

### **2.3 - Undo/Redo System**
**Epic:** User Experience  
**Story ID:** US-UX-001  
**Priority:** P2 - High  

> As a Satisfactory player, I want to undo and redo my actions so that I can experiment freely without fear of losing work.

**Acceptance Criteria:**
- [ ] Multi-level undo/redo for all edit operations
- [ ] Supports track, node, signal, and station edits
- [ ] Minimum 100 actions or 50MB memory cap in undo stack
- [ ] Keyboard shortcuts for undo/redo
- [ ] Visual indication of undo/redo availability

**Technical Notes for Code Lead:**
- Command pattern implementation
- Memory management for undo stack
- State serialization/deserialization
- Integration with all edit operations

---

### **2.4 - Node and Junction Management**
**Epic:** Track Design  
**Story ID:** US-TRACK-002  
**Priority:** P2 - High  

> As a Satisfactory player, I want to create and manage track nodes and junctions so that I can build complex railway networks.

**Acceptance Criteria:**
- [ ] Create nodes of types: regular, junction, stationAnchor
- [ ] Junctions support degree ≥ 3 connections
- [ ] Detect and warn about impossible junction geometry based on configurable angle/overlap thresholds
- [ ] Visual distinction between node types
- [ ] Node properties editable through Properties panel
- [ ] Nodes snap to grid when enabled
- [ ] Junction validation runs in real-time during edits

**Technical Notes for Code Lead:**
- Node type system design
- Junction geometry validation algorithms
- Properties panel architecture
- Real-time validation integration

---

## **PRIORITY 3: Enhanced Features (Could Have)**
*Important features that enhance usability*

### **3.1 - Station Management**
**Epic:** Station Management  
**Story ID:** US-STATION-001  
**Priority:** P3 - Medium  

> As a Satisfactory player, I want to create named stations attached to track nodes so that I can define stops for my trains.

**Acceptance Criteria:**
- [ ] Create stations using Station tool
- [ ] Assign user-defined names to stations
- [ ] Attach stations to track nodes
- [ ] Validate that station platforms connect to block graph
- [ ] Detect unreachable stations and flag as warnings
- [ ] Station properties editable (name, platforms, metadata)
- [ ] Stations support undo/redo operations
- [ ] Stations must connect to nodes with at least one segment

**Technical Notes for Code Lead:**
- Station data model and node relationships
- Reachability analysis algorithm
- Station naming and metadata management
- Integration with block system

---

### **3.2 - Advanced Error Detection**
**Epic:** Error Detection  
**Story ID:** US-ERROR-002  
**Priority:** P3 - Medium  

> As a Satisfactory player, I want comprehensive error detection so that I can identify all potential issues in my railway design.

**Acceptance Criteria:**
- [ ] Detect missing signals causing mega-blocks across junctions
- [ ] Flag conflicting signal directions on same segment
- [ ] Validate junction geometry against configurable thresholds
- [ ] Detect unreachable stations
- [ ] Identify signal overlaps within tolerance
- [ ] Flag two opposing one-way signals creating deadlocks as errors
- [ ] Issues Panel categorizes items as Errors vs Warnings
- [ ] Clickable issues focus and highlight offending elements on map

**Technical Notes for Code Lead:**
- Advanced graph analysis algorithms
- Issue categorization system
- UI integration for issue highlighting
- Configurable validation thresholds

---

### **3.3 - Project Export/Import**
**Epic:** Project Management  
**Story ID:** US-PROJ-002  
**Priority:** P3 - Medium  

> As a Satisfactory player, I want to export and import my railway designs as files so that I can share them or backup my work.

**Acceptance Criteria:**
- [ ] Export projects as JSON files with complete data
- [ ] Import projects from JSON files
- [ ] Choice dialog for replace vs merge when importing
- [ ] Schema version tracking and migration for older versions
- [ ] Round-trip integrity: Import(Export(Project)) yields equivalent model
- [ ] Structured error reporting for invalid JSON imports
- [ ] JSON follows specified schema with required fields

**Technical Notes for Code Lead:**
- JSON schema definition and validation
- File I/O handling in browser
- Schema migration system design
- Data integrity validation

---

### **3.4 - Settings Management**
**Epic:** User Experience  
**Story ID:** US-UX-002  
**Priority:** P3 - Medium  

> As a Satisfactory player, I want to customize the application settings so that it works best for my preferences and needs.

**Acceptance Criteria:**
- [ ] Settings panel with units, grid size, snap tolerances configuration
- [ ] Colorblind-friendly palette options
- [ ] Performance quality settings
- [ ] Settings persist in Local Storage per browser
- [ ] Tooltips and inline help for each setting
- [ ] Settings accessible via keyboard navigation

**Technical Notes for Code Lead:**
- Settings data model and persistence
- Settings panel UI component
- Integration with rendering system
- Accessibility implementation

---

## **PRIORITY 4: Polish & Performance (Nice to Have)**
*Features that enhance the overall experience*

### **4.1 - Layer Management**
**Epic:** Map Visualization  
**Story ID:** US-MAP-002  
**Priority:** P4 - Low  

> As a Satisfactory player, I want to control the visibility of different map layers so that I can focus on specific aspects of my railway design.

**Acceptance Criteria:**
- [ ] Toggle visibility for: Track, Signals, Stations, Blocks, Issues, Grid, Background Map
- [ ] Per-layer opacity controls available
- [ ] Z-order presets for layer stacking
- [ ] Layer settings persist in browser Local Storage
- [ ] Layer panel is keyboard accessible and screen-reader compatible

**Technical Notes for Code Lead:**
- Layer management system architecture
- Rendering pipeline with layer support
- UI components for layer controls
- Accessibility implementation

---

### **4.2 - Keyboard Accessibility**
**Epic:** User Experience  
**Story ID:** US-UX-003  
**Priority:** P4 - Low  

> As a Satisfactory player with accessibility needs, I want full keyboard access to all features so that I can use the application without a mouse.

**Acceptance Criteria:**
- [ ] All primary actions keyboard accessible: draw, select, move, place signal, delete
- [ ] Logical tab order for all controls
- [ ] Focus visible indicators throughout interface
- [ ] Issues Panel and Layers Panel fully screen-reader navigable
- [ ] Keyboard shortcuts documented and consistent
- [ ] WCAG 2.1 AA contrast ratios for panels and overlays

**Technical Notes for Code Lead:**
- Keyboard event handling system
- Focus management strategy
- Screen reader compatibility
- Accessibility testing requirements

---

### **4.3 - Project Sharing**
**Epic:** Project Management  
**Story ID:** US-PROJ-003  
**Priority:** P4 - Low  

> As a Satisfactory player, I want to share read-only views of my railway designs via URL so that others can see my work.

**Acceptance Criteria:**
- [ ] Generate shareable URLs with view parameters (pan/zoom, layer toggles)
- [ ] URLs don't embed full project data for security
- [ ] Optional: "Compress to URL" for small projects using base64+deflate
- [ ] Prompt for file export if URL would exceed safe length
- [ ] Shared views are read-only

**Technical Notes for Code Lead:**
- URL parameter encoding/decoding
- Base64 compression implementation
- Read-only mode implementation
- URL length management

---

### **4.4 - Performance Optimization**
**Epic:** Technical Infrastructure  
**Story ID:** US-TECH-001  
**Priority:** P4 - Low  

> As a Satisfactory player, I want the application to perform smoothly with large railway networks so that I can design complex systems without lag.

**Acceptance Criteria:**
- [ ] Render 5k segments, 5k signals, 200 stations at ≥55 FPS on mid-range laptop (1080p)
- [ ] Block computation completes within 200ms for 10k elements
- [ ] Smooth zooming and panning on mouse and trackpad
- [ ] Built with React and TypeScript
- [ ] Vite build system for GitHub Pages compatibility

**Technical Notes for Code Lead:**
- Performance profiling and optimization
- Canvas rendering optimization
- Memory management strategies
- Build pipeline configuration

---

### **4.5 - Cross-Browser Compatibility**
**Epic:** Technical Infrastructure  
**Story ID:** US-TECH-002  
**Priority:** P4 - Low  

> As a Satisfactory player, I want the application to work on my preferred browser so that I can use it regardless of my platform choice.

**Acceptance Criteria:**
- [ ] Latest Chrome, Edge, and Firefox on desktop supported
- [ ] Safari recent stable version supported
- [ ] No server dependencies for core features
- [ ] Works offline after first load
- [ ] Progressive Web App capabilities (optional)

**Technical Notes for Code Lead:**
- Browser compatibility testing strategy
- Polyfills and feature detection
- Service worker implementation for offline support
- PWA manifest configuration

---

## **DEVELOPMENT NOTES FOR CODE LEAD**

### **Technical Architecture Decisions Needed:**
1. **Rendering System**: Canvas vs SVG vs hybrid approach
2. **State Management**: Redux/Zustand vs React Context vs custom solution
3. **Data Structure**: Graph representation for railway network
4. **Performance Strategy**: Virtualization, LOD, or spatial indexing
5. **File Format**: JSON schema design and versioning strategy

### **Key Performance Requirements:**
- 5k segments + 5k signals + 200 stations at ≥55 FPS
- Block computation within 200ms for 10k elements
- Real-time validation without blocking UI
- Smooth pan/zoom on mid-range hardware

### **External Dependencies:**
- Satisfactory world map assets (coordinate system alignment critical)
- GitHub Pages deployment constraints
- Local Storage limitations and fallbacks

### **Testing Strategy Recommendations:**
- Unit tests for graph algorithms (min 80% coverage)
- Performance benchmarks for large datasets
- Cross-browser compatibility matrix
- Accessibility testing with screen readers

---

**Next Steps:**
1. Code Lead technical refinement and estimation
2. Sprint planning with prioritized stories
3. Architecture design document creation
4. Development environment setup
