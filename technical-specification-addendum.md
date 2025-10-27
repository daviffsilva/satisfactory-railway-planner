# Technical Specification Addendum - Dev Lead Clarifications

**Document Version:** 1.0  
**Created:** 2025-10-27  
**For:** Development Team  
**Related:** user-stories-prioritized.md  

---

## **EXECUTIVE SUMMARY**

Product Owner decisions in response to Dev Lead technical questions. These clarifications update user story priorities and technical implementation approach.

**Key Changes:**
- ✅ Curved segments deferred from P1 to P2 (risk reduction)
- ✅ Community map asset approach approved for MVP
- ✅ Hybrid coordinate system (store cm, display m)
- ✅ Default grid size clarified (800cm = 8m foundation grid)

---

## **1. SATISFACTORY WORLD MAP ASSET**

### **Decision: Community Map Strategy**

**MVP Approach (P1):**
- Use high-quality community-provided Satisfactory world map
- Source: Satisfactory Tools community or equivalent trusted source
- Rationale: Official assets unavailable; community maps widely accepted by players

**Technical Implementation:**
```typescript
interface MapAsset {
  source: 'community' | 'official';
  version: string;
  coordinateSystem: 'satisfactory-world';
  origin: [0, 0, 0]; // Satisfactory world origin
  bounds: {
    minX: number; // centimeters
    maxX: number;
    minY: number;
    maxY: number;
  };
}
```

**Future Migration Path:**
- Design map loading system to be asset-agnostic
- If official assets become available, create P3/P4 migration story
- Maintain backward compatibility with community-based projects

---

## **2. COORDINATE SYSTEM ARCHITECTURE**

### **Decision: Hybrid Coordinate System**

**Internal Storage:** Satisfactory Native (Centimeters)
```typescript
interface Node {
  id: string;
  x: number; // centimeters (Satisfactory native)
  y: number; // centimeters (Satisfactory native)
  z?: number; // optional elevation (centimeters)
  type: 'regular' | 'junction' | 'stationAnchor';
}
```

**User Interface Display:** Meters with Decimal Precision
```typescript
// Conversion utilities
const toDisplayUnits = (cm: number): number => cm / 100; // cm to meters
const toStorageUnits = (m: number): number => m * 100;   // meters to cm

// Display formatting
const formatCoordinate = (cm: number): string => {
  const meters = toDisplayUnits(cm);
  return `${meters.toFixed(2)}m`;
};
```

**Coordinate System Properties:**
- **Origin Point:** Satisfactory world origin (0,0,0)
- **Axis System:** X-East, Y-North, Z-Up (Satisfactory standard)
- **Precision:** Centimeter accuracy maintained internally
- **Display Options:** Settings panel allows cm/m/ft unit switching

**Benefits:**
- Preserves accuracy for import/export to game
- Avoids rounding errors from conversion
- User-friendly display (5.2m vs 520cm)
- Future-proof for official integration

---

## **3. GRID SYSTEM SPECIFICATION**

### **Decision: Foundation-Grid Based System**

**Default Grid Size:** 800cm (8 meters)
- **Rationale:** Aligns with Satisfactory's foundation grid system
- **Usage:** Railway infrastructure typically snaps to foundation grid
- **Community Standard:** Widely used in planning tools

**Grid Options for Settings Panel:**
```typescript
interface GridSettings {
  size: number; // centimeters
  visible: boolean;
  snapEnabled: boolean;
  opacity: number; // 0-1
}

const GRID_PRESETS = {
  foundation: 800,    // 8m - standard foundation
  halfFoundation: 400, // 4m - half foundation
  doubleFoundation: 1600, // 16m - double foundation
  custom: number      // user-definable
};
```

**Grid Features:**
- Toggle visibility on/off
- Snap-to-grid configurable
- Visual opacity controls
- Multiple preset sizes
- Custom size input

---

## **4. TRACK IMPLEMENTATION PRIORITY CHANGE**

### **Decision: Defer Curves to P2**

**P1 Scope (Simplified):**
- Straight line segments only
- Node-to-node direct connections
- Basic geometry validation (no curve math)

**P2 Addition:**
- Bezier curve support
- Control point manipulation
- Curve-specific validation
- Integration with block/signal systems

**Impact Analysis:**
```
Risk Reduction:     HIGH ✅
User Value Impact:  LOW  ✅ (80% of networks achievable with straight tracks)
Technical Debt:     MEDIUM (curve math affects multiple systems)
Development Speed:  HIGH ✅ (faster MVP delivery)
```

**P1 Geometry Model:**
```typescript
interface Segment {
  id: string;
  aNodeId: string;
  bNodeId: string;
  geometry: 'straight'; // P1 only
  // controlPoints deferred to P2
}
```

**P2 Geometry Model Extension:**
```typescript
interface Segment {
  id: string;
  aNodeId: string;
  bNodeId: string;
  geometry: 'straight' | 'bezier'; // P2 adds bezier
  controlPoints?: [number, number][]; // P2 adds control points
}
```

---

## **5. DATA MODEL UPDATES**

### **Core Entities (P1)**

```typescript
// Project structure
interface Project {
  id: string;
  name: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  schemaVersion: string; // "1.0.0"
  settings: ProjectSettings;
}

interface ProjectSettings {
  grid: GridSettings;
  display: DisplaySettings;
  units: 'cm' | 'm' | 'ft';
  mapAsset: MapAsset;
}

// Network elements
interface Node {
  id: string;
  x: number; // centimeters
  y: number; // centimeters
  z?: number; // optional elevation
  type: 'regular' | 'junction' | 'stationAnchor';
}

interface Segment {
  id: string;
  aNodeId: string;
  bNodeId: string;
  geometry: 'straight'; // P1 only
}

// P2 additions
interface Signal {
  id: string;
  segmentId: string;
  offsetT: number; // 0.0 to 1.0 position on segment
  direction: 'AtoB' | 'BtoA' | 'Both';
}

interface Station {
  id: string;
  name: string;
  nodeId: string;
  platforms?: number;
  metadata?: Record<string, any>;
}
```

---

## **6. TECHNICAL ARCHITECTURE DECISIONS**

### **Required for P1 Implementation:**

**1. Coordinate Conversion Layer**
```typescript
class CoordinateSystem {
  static toDisplay(cm: number): number;
  static toStorage(m: number): number;
  static formatDisplay(cm: number, unit: 'cm'|'m'|'ft'): string;
}
```

**2. Map Asset Management**
```typescript
interface MapManager {
  loadCommunityMap(): Promise<MapAsset>;
  getCoordinateBounds(): BoundingBox;
  worldToScreen(worldX: number, worldY: number): [number, number];
  screenToWorld(screenX: number, screenY: number): [number, number];
}
```

**3. Grid System**
```typescript
interface GridRenderer {
  setSize(centimeters: number): void;
  setVisibility(visible: boolean): void;
  setOpacity(opacity: number): void;
  snapToGrid(x: number, y: number): [number, number];
}
```

**4. Simplified Geometry (P1)**
```typescript
interface GeometryValidator {
  validateStraightSegment(segment: Segment): ValidationResult;
  detectIntersections(segments: Segment[]): Intersection[];
  // Curve validation deferred to P2
}
```

---

## **7. PERFORMANCE REQUIREMENTS**

**Updated Benchmarks:**
- **P1 Target:** 2k straight segments at ≥55 FPS (simplified from curves)
- **P2 Target:** 5k segments (mixed straight/curve) at ≥55 FPS
- **Validation:** <200ms for 10k elements (straight segments only in P1)

**Optimization Strategy:**
- P1: Focus on straight-line rendering optimization
- P2: Add curve rendering with LOD (Level of Detail)
- Spatial indexing for large networks (P2/P3)

---

## **8. DEVELOPMENT MILESTONES**

### **P1 Sprint Goals:**
1. ✅ Community map integration with coordinate system
2. ✅ Straight track creation with grid snapping
3. ✅ Basic project persistence (Local Storage)
4. ✅ Simple validation (intersections, orphans)

### **P2 Sprint Goals:**
1. ✅ Bezier curve implementation
2. ✅ Signal placement system
3. ✅ Block computation and visualization
4. ✅ Enhanced validation

**Risk Mitigation:**
- P1 provides working MVP for user testing
- P2 adds complexity only after core system proven
- Community map approach reduces external dependencies

---

## **9. TESTING STRATEGY**

### **P1 Testing Focus:**
- Unit tests for coordinate conversion (100% coverage)
- Integration tests for straight-line geometry
- Performance tests with 2k straight segments
- Cross-browser testing for map rendering

### **P2 Testing Additions:**
- Curve mathematics unit tests
- Signal placement integration tests
- Block computation performance tests
- Complex network validation scenarios

---

## **10. MIGRATION AND COMPATIBILITY**

### **Schema Versioning:**
```json
{
  "schemaVersion": "1.0.0",
  "project": { ... },
  "mapAsset": {
    "source": "community",
    "version": "2024.1"
  }
}
```

### **Future Compatibility:**
- P1 data model supports P2 extensions
- Community map projects compatible with future official maps
- Coordinate system supports elevation (Z) for future 3D features

---

**NEXT ACTIONS FOR DEV TEAM:**
1. ✅ Begin P1 implementation with simplified scope
2. ✅ Source high-quality community Satisfactory map
3. ✅ Implement coordinate conversion utilities first
4. ✅ Design grid system with foundation alignment
5. ✅ Create basic project structure with settings persistence

**Questions Resolved:**
- ✅ Map asset source and coordinate system
- ✅ Grid size and alignment
- ✅ Curve implementation timeline
- ✅ Technical architecture approach

---

*This document supersedes any conflicting technical details in the original user stories. Updated user stories available in user-stories-prioritized.md*