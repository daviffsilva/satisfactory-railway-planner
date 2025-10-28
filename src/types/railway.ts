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
  geometry: 'straight';  // P1: straight only
  metadata?: {
    createdAt: number;
    length?: number;  // cached, in centimeters
  };
}

// P2 Preview - include type but not implementation
export interface Signal {
  id: string;
  segmentId: string;
  offsetT: number;  // position along segment [0.0, 1.0]
  direction: 'AtoB' | 'BtoA' | 'Both';
  metadata?: {
    createdAt: number;
  };
}

export type IssueType = 
  | 'disconnected_network'  // Multiple independent networks (informational only)
  | 'self_intersection'
  | 'duplicate_segment';

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
