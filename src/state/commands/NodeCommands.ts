import { Command } from '../../types/commands';
import { AppState } from '../../types/state';
import { Node } from '../../types/railway';
import { produce } from 'immer';

export class CreateNodeCommand implements Command {
  id: string;
  type = 'CREATE_NODE';
  timestamp: number;
  
  private node: Node;
  
  constructor(node: Node) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.node = node;
  }
  
  execute(state: AppState): AppState {
    if (!state.currentProject) return state;
    
    return produce(state, draft => {
      if (draft.currentProject) {
        draft.currentProject.nodes.push(this.node);
        draft.currentProject.updatedAt = new Date().toISOString();
      }
    });
  }
  
  undo(state: AppState): AppState {
    if (!state.currentProject) return state;
    
    return produce(state, draft => {
      if (draft.currentProject) {
        draft.currentProject.nodes = draft.currentProject.nodes.filter(n => n.id !== this.node.id);
        draft.currentProject.updatedAt = new Date().toISOString();
      }
    });
  }
  
  describe(): string {
    return `Create node at (${(this.node.x / 100).toFixed(1)}m, ${(this.node.y / 100).toFixed(1)}m)`;
  }
}

export class DeleteNodeCommand implements Command {
  id: string;
  type = 'DELETE_NODE';
  timestamp: number;
  
  private node: Node;
  private deletedSegmentIds: string[];
  
  constructor(node: Node, deletedSegmentIds: string[] = []) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.node = node;
    this.deletedSegmentIds = deletedSegmentIds;
  }
  
  execute(state: AppState): AppState {
    if (!state.currentProject) return state;
    
    return produce(state, draft => {
      if (draft.currentProject) {
        // Remove node and connected segments
        const newNodes = draft.currentProject.nodes.filter(n => n.id !== this.node.id);
        const newSegments = draft.currentProject.segments.filter(
          s => s.aNodeId !== this.node.id && s.bNodeId !== this.node.id
        );
        
        // Store which segments were deleted for undo
        this.deletedSegmentIds = draft.currentProject.segments
          .filter(s => s.aNodeId === this.node.id || s.bNodeId === this.node.id)
          .map(s => s.id);
        
        draft.currentProject.nodes = newNodes;
        draft.currentProject.segments = newSegments;
        draft.currentProject.updatedAt = new Date().toISOString();
      }
    });
  }
  
  undo(state: AppState): AppState {
    if (!state.currentProject) return state;
    
    return produce(state, draft => {
      if (draft.currentProject) {
        // Restore node
        draft.currentProject.nodes.push(this.node);
        // Note: Restoring segments requires storing them in the command
        // This is simplified - full implementation should store deleted segments
        draft.currentProject.updatedAt = new Date().toISOString();
      }
    });
  }
  
  describe(): string {
    return `Delete node ${this.node.id.slice(0, 8)}`;
  }
}

export class MoveNodesCommand implements Command {
  id: string;
  type = 'MOVE_NODES';
  timestamp: number;
  
  private nodeIds: string[];
  private delta: { x: number; y: number };
  
  constructor(nodeIds: string[], delta: { x: number; y: number }) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.nodeIds = nodeIds;
    this.delta = delta;
  }
  
  execute(state: AppState): AppState {
    if (!state.currentProject) return state;
    
    return produce(state, draft => {
      if (draft.currentProject) {
        const newNodes = draft.currentProject.nodes.map(node => {
          if (this.nodeIds.includes(node.id)) {
            return {
              ...node,
              x: node.x + this.delta.x,
              y: node.y + this.delta.y,
            };
          }
          return node;
        });
        
        draft.currentProject.nodes = newNodes;
        draft.currentProject.updatedAt = new Date().toISOString();
      }
    });
  }
  
  undo(state: AppState): AppState {
    if (!state.currentProject) return state;
    
    return produce(state, draft => {
      if (draft.currentProject) {
        // Move back by negative delta
        const newNodes = draft.currentProject.nodes.map(node => {
          if (this.nodeIds.includes(node.id)) {
            return {
              ...node,
              x: node.x - this.delta.x,
              y: node.y - this.delta.y,
            };
          }
          return node;
        });
        
        draft.currentProject.nodes = newNodes;
        draft.currentProject.updatedAt = new Date().toISOString();
      }
    });
  }
  
  describe(): string {
    return `Move ${this.nodeIds.length} node(s)`;
  }
}
