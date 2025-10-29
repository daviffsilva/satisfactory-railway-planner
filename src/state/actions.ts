import { Node, Segment, Signal, Issue, Project, ProjectSettings, Block } from '../types/railway';
import { ToolType, Point } from '../types/state';
import { Command } from '../types/commands';

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
  
  // Signal actions (P2)
  | { type: 'SIGNAL_CREATE'; payload: { signal: Signal } }
  | { type: 'SIGNAL_UPDATE'; payload: { id: string; changes: Partial<Signal> } }
  | { type: 'SIGNAL_DELETE'; payload: { id: string } }
  
  // Block computation (P2)
  | { type: 'BLOCKS_COMPUTE'; payload: { blocks: Block[] } }
  | { type: 'BLOCK_SELECT'; payload: { blockId: string | null } }
  | { type: 'BLOCK_VIEW_TOGGLE' }
  
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
  | { type: 'CONTROL_POINT_EDIT'; payload: { segmentId: string | null } }
  
  // Persistence
  | { type: 'SAVE_START' }
  | { type: 'SAVE_COMPLETE'; payload: { time: number; error: string | null } }
  
  // Undo/Redo (P2)
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'EXECUTE_COMMAND'; payload: { command: Command } };
