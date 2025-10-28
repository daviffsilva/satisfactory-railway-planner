import { Project, Issue, Point, ProjectSettings } from './railway';

export type ToolType = 
  | 'select'
  | 'track'
  | 'signal'
  | 'delete'
  | 'pan';

export interface Viewport {
  offsetX: number;      // pan offset in screen pixels
  offsetY: number;
  scale: number;        // zoom level, 1.0 = 100%
  minScale: number;     // 0.1
  maxScale: number;     // 5.0
}

export interface AppState {
  // Project data
  currentProject: Project | null;
  
  // Computed data
  issues: Issue[];
  
  // UI state
  viewport: Viewport;
  selectedTool: ToolType;
  selectedElementIds: Set<string>;
  
  // Interaction state
  isDrawing: boolean;
  drawStartNodeId: string | null;
  hoverPoint: Point | null;
  hoverElementId: string | null;
  
  // Persistence state
  isSaving: boolean;
  lastSaveTime: number | null;
  saveError: string | null;
}

export const DEFAULT_VIEWPORT: Viewport = {
  offsetX: 400,
  offsetY: 300,
  scale: 1.0,
  minScale: 0.1,
  maxScale: 5.0,
};

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  grid: {
    size: 800,      // 8 meters
    visible: true,
    snapEnabled: true,
    opacity: 0.3,
  },
  display: {
    showNodes: true,
    showSegments: true,
    showSignals: true,
    showIssues: true,
  },
  units: 'm',
};