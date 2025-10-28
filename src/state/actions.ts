import { Node, Segment, Signal, Issue, Project, ProjectSettings, Point, Block } from '../types/railway';
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
  | { type: 'SEGMENT_UPDATE'; payload: { id: string; changes: Partial<Segment> } }
  | { type: 'SEGMENT_DELETE'; payload: { id: string } }
  
  // Signal actions
  | { type: 'SIGNAL_CREATE'; payload: { signal: Signal } }
  | { type: 'SIGNAL_UPDATE'; payload: { id: string; changes: Partial<Signal> } }
  | { type: 'SIGNAL_DELETE'; payload: { id: string } }
  
  // Block actions
  | { type: 'BLOCKS_COMPUTED'; payload: { blocks: Block[] } }
  | { type: 'BLOCK_SELECT'; payload: { blockId: string | null } }
  | { type: 'BLOCKS_TOGGLE'; payload: { show: boolean } }
  
  // Signal placement actions
  | { type: 'SIGNAL_PLACEMENT_START'; payload: { segmentId: string } }
  | { type: 'SIGNAL_PLACEMENT_END' }
  
  // Curve editing actions  
  | { type: 'CURVE_EDIT_START'; payload: { segmentId: string } }
  | { type: 'CURVE_EDIT_END' }
  | { type: 'CURVE_UPDATE_CONTROL_POINT'; payload: { segmentId: string; controlPoint: Point } }
  
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