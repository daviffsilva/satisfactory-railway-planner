/**
 * Core data types for railway network modeling
 * 
 * Coordinate System:
 * - Storage: Centimeters (Satisfactory native)
 * - Display: Meters (user-friendly)
 * - Origin: Satisfactory world origin (0,0,0)
 * - Axis: X-East, Y-North, Z-Up
 */

export interface Point {
  x: number;  // centimeters
  y: number;  // centimeters
}

export interface Node {
  id: string;
  x: number;  // centimeters
  y: number;  // centimeters
  z?: number; // optional elevation (centimeters), reserved for future
  type: 'regular' | 'junction' | 'stationAnchor';
  metadata?: {
    createdAt: number;
    label?: string;
  };
}

export interface Segment {
  id: string;
  aNodeId: string;
  bNodeId: string;
  geometry: 'straight' | 'bezier';  // P2: Added bezier support
  metadata?: {
    createdAt: number;
    length?: number;  // cached, in centimeters
    controlPoint?: Point;  // For bezier curves
  };
}

/**
 * Signal represents a control point on a segment
 * Signals divide the network into blocks for train collision prevention
 */
export interface Signal {
  id: string;
  segmentId: string;
  offsetT: number;          // Position along segment [0.0, 1.0]
  orientation: SignalOrientation;
  type: 'block' | 'path';   // P2: only block signals implemented
  metadata?: {
    createdAt: number;
    label?: string;
  };
}

export type SignalOrientation = 
  | 'AtoB'          // One-way: nodeA → nodeB
  | 'BtoA'          // One-way: nodeB → nodeA
  | 'bidirectional'; // Two-way

/**
 * Block represents a track section where only one train can be
 * Derived data structure, computed from segments and signals
 */
export interface Block {
  id: string;
  segmentIds: string[];     // Segments in this block
  boundarySignalIds: string[]; // Signals at block boundaries
  length: number;           // Total length in centimeters
  connectedBlockIds: string[]; // Adjacent blocks
  color: string;            // Unique color for visualization
  metadata?: {
    isOrphan: boolean;      // Not connected to main network
  };
}

/**
 * Signal validation issues
 */
export type SignalIssueType =
  | 'signal_overlap'        // Two signals too close
  | 'signal_conflict'       // Opposing one-way signals (deadlock)
  | 'mega_block'            // Block spans multiple junctions
  | 'junction_too_complex'  // Too many branches at junction
  | 'junction_angle_too_small' // Segments too close at junction
  | 'curve_extreme';        // Curve has extreme curvature

// Add to existing IssueType union
export type IssueType = 
  | 'orphaned_track'
  | 'self_intersection'
  | 'duplicate_segment'
  | SignalIssueType;

export interface Issue {
  id: string;
  severity: 'error' | 'warning';
  type: IssueType;
  elementIds: string[];
  message: string;
  position?: Point;  // where to focus camera
}

export interface Project {
  id: string;
  name: string;
  schemaVersion: string;  // "1.0.0"
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
  nodes: Node[];
  segments: Segment[];
  signals: Signal[];      // empty in P1
  settings: ProjectSettings;
}

export interface ProjectSettings {
  grid: GridSettings;
  display: DisplaySettings;
  units: 'cm' | 'm' | 'ft';
}

export interface GridSettings {
  size: number;         // centimeters, default 800
  visible: boolean;     // default true
  snapEnabled: boolean; // default true
  opacity: number;      // 0-1, default 0.3
}

export interface DisplaySettings {
  showNodes: boolean;
  showSegments: boolean;
  showSignals: boolean;
  showIssues: boolean;
}