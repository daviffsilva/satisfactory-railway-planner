import { Project, Issue, Point, ProjectSettings, Block } from './railway';
import { CommandHistory } from './commands';

export type ToolType = 
  | 'select'
  | 'track'
  | 'signal'
  | 'delete'
  | 'pan'
  | 'curve';  // P2: curve editing tool

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
  blocks: Block[];  // P2: computed blocks
  
  // UI state
  viewport: Viewport;
  selectedTool: ToolType;
  selectedElementIds: Set<string>;
  showBlockView: boolean;  // P2: toggle block visualization
  selectedBlockId: string | null;  // P2: selected block for highlighting
  
  // Interaction state
  isDrawing: boolean;
  drawStartNodeId: string | null;
  hoverPoint: Point | null;
  hoverElementId: string | null;
  editingControlPoint: string | null;  // P2: segment ID being edited
  
  // Persistence state
  isSaving: boolean;
  lastSaveTime: number | null;
  saveError: string | null;
  
  // P2: Command history for undo/redo
  commandHistory: CommandHistory;
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
