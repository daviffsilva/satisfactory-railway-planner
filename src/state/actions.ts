import { Node, Segment, Signal, Issue, Project, ProjectSettings, Point } from '../types/railway';
import { ToolType } from '../types/state';

export type Action =
  // Project actions
  | { type: 'PROJECT_NEW'; payload: { name: string } }
  | { type: 'PROJECT_LOAD'; payload: { project: Project } }
  | { type: 'PROJECT_UPDATE_NAME'; payload: { name: string } }
  
  // Node actions
  | { type: 'NODE_CREATE'; payload: { node: Node } }
  | { type: 'NODE_UPDATE'; payload: { id: string; changes: Partial<Node> } }
  | { type: 'NODE_DELETE'; payload: { id: string } }
  | { type: 'NODES_MOVE'; payload: { ids: string[]; delta: Point } }
  
  // Segment actions
  | { type: 'SEGMENT_CREATE'; payload: { segment: Segment } }
  | { type: 'SEGMENT_DELETE'; payload: { id: string } }
  
  // Signal actions (P2, stub for now)
  | { type: 'SIGNAL_CREATE'; payload: { signal: Signal } }
  | { type: 'SIGNAL_DELETE'; payload: { id: string } }
  
  // Validation
  | { type: 'VALIDATION_COMPLETE'; payload: { issues: Issue[] } }
  
  // UI actions
  | { type: 'TOOL_SELECT'; payload: { tool: ToolType } }
  | { type: 'VIEWPORT_PAN'; payload: { deltaX: number; deltaY: number } }
  | { type: 'VIEWPORT_ZOOM'; payload: { delta: number; centerX: number; centerY: number } }
  | { type: 'VIEWPORT_RESET' }
  | { type: 'SETTINGS_UPDATE'; payload: Partial<ProjectSettings> }
  
  // Selection
  | { type: 'SELECTION_SET'; payload: { ids: string[] } }
  | { type: 'SELECTION_ADD'; payload: { ids: string[] } }
  | { type: 'SELECTION_CLEAR' }
  
  // Interaction
  | { type: 'DRAW_START'; payload: { nodeId: string } }
  | { type: 'DRAW_END' }
  | { type: 'HOVER_UPDATE'; payload: { point: Point | null; elementId: string | null } }
  
  // Persistence
  | { type: 'SAVE_START' }
  | { type: 'SAVE_COMPLETE'; payload: { time: number; error: string | null } };