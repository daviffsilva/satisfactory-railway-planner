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
  geometry: 'straight' | 'bezier';  // P2: added bezier curves
  metadata?: {
    createdAt: number;
    length?: number;  // cached, in centimeters
    controlPoint?: Point;  // For bezier curves
  };
}

/**
 * Signal represents a control point on a segment
 * Signals divide the network into blocks for train collision prevention
 * 
 * Signal Types (Satisfactory Railway System):
 * 
 * BLOCK SIGNAL:
 * - Traditional railway block system
 * - Divides track into blocks
 * - Only ONE train allowed per block at a time
 * - Simpler logic, easier to set up
 * - Best for: Simple routes, bidirectional tracks, stations
 * 
 * PATH SIGNAL:
 * - Advanced pathfinding signal system
 * - Reserves entire path through multiple blocks
 * - Multiple trains can share same block if on different reserved paths
 * - Prevents deadlocks in complex junctions
 * - Best for: Complex intersections, unidirectional loops, high-traffic areas
 */
export interface Signal {
  id: string;
  segmentId: string;
  offsetT: number;          // Position along segment [0.0, 1.0]
  orientation: SignalOrientation;
  type: 'block' | 'path';   // Both types fully implemented in P2
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
  | 'path_signal_complexity'; // Path signal in simple scenario (suggestion)

/**
 * Junction validation issues
 */
export type JunctionIssueType =
  | 'junction_too_complex'  // Too many branches
  | 'junction_angle_too_small'; // Angle between tracks too acute

/**
 * Curve validation issues
 */
export type CurveIssueType =
  | 'curve_extreme';        // Curve has extreme curvature

export type IssueType = 
  | 'disconnected_network'  // Multiple independent networks (informational only)
  | 'self_intersection'
  | 'duplicate_segment'
  | SignalIssueType
  | JunctionIssueType
  | CurveIssueType;

export interface Issue {
  id: string;
  severity: 'error' | 'warning' | 'info';  // 'info' for informational messages
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
