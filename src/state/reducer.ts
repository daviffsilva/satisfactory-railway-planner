import { produce } from 'immer';
import { AppState, DEFAULT_VIEWPORT, DEFAULT_PROJECT_SETTINGS } from '../types/state';
import { Action } from './actions';

export const initialState: AppState = {
  currentProject: null,
  issues: [],
  viewport: DEFAULT_VIEWPORT,
  selectedTool: 'select',
  selectedElementIds: new Set(),
  isDrawing: false,
  drawStartNodeId: null,
  hoverPoint: null,
  hoverElementId: null,
  isSaving: false,
  lastSaveTime: null,
  saveError: null,
};

export function reducer(state: AppState, action: Action): AppState {
  return produce(state, (draft) => {
    switch (action.type) {
      // PROJECT ACTIONS
      case 'PROJECT_NEW': {
        draft.currentProject = {
          id: crypto.randomUUID(),
          name: action.payload.name,
          schemaVersion: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [],
          segments: [],
          signals: [],
          settings: DEFAULT_PROJECT_SETTINGS,
        };
        break;
      }
      
      case 'PROJECT_LOAD': {
        draft.currentProject = action.payload.project;
        draft.issues = [];
        draft.selectedElementIds = new Set();
        break;
      }
      
      case 'PROJECT_UPDATE_NAME': {
        if (draft.currentProject) {
          draft.currentProject.name = action.payload.name;
          draft.currentProject.updatedAt = new Date().toISOString();
        }
        break;
      }
      
      // NODE ACTIONS
      case 'NODE_CREATE': {
        if (draft.currentProject) {
          draft.currentProject.nodes.push(action.payload.node);
          draft.currentProject.updatedAt = new Date().toISOString();
        }
        break;
      }
      
      case 'NODE_UPDATE': {
        if (draft.currentProject) {
          const node = draft.currentProject.nodes.find(n => n.id === action.payload.id);
          if (node) {
            Object.assign(node, action.payload.changes);
            draft.currentProject.updatedAt = new Date().toISOString();
          }
        }
        break;
      }
      
      case 'NODE_DELETE': {
        if (draft.currentProject) {
          const nodeId = action.payload.id;
          
          // Remove node
          draft.currentProject.nodes = draft.currentProject.nodes.filter(n => n.id !== nodeId);
          
          // Remove all segments connected to this node
          draft.currentProject.segments = draft.currentProject.segments.filter(
            s => s.aNodeId !== nodeId && s.bNodeId !== nodeId
          );
          
          draft.currentProject.updatedAt = new Date().toISOString();
        }
        break;
      }
      
      // SEGMENT ACTIONS
      case 'SEGMENT_CREATE': {
        if (draft.currentProject) {
          draft.currentProject.segments.push(action.payload.segment);
          draft.currentProject.updatedAt = new Date().toISOString();
        }
        break;
      }
      
      case 'SEGMENT_DELETE': {
        if (draft.currentProject) {
          draft.currentProject.segments = draft.currentProject.segments.filter(
            s => s.id !== action.payload.id
          );
          draft.currentProject.updatedAt = new Date().toISOString();
        }
        break;
      }
      
      // VALIDATION
      case 'VALIDATION_COMPLETE': {
        draft.issues = action.payload.issues;
        break;
      }
      
      // UI ACTIONS
      case 'TOOL_SELECT': {
        draft.selectedTool = action.payload.tool;
        draft.isDrawing = false;
        draft.drawStartNodeId = null;
        break;
      }
      
      case 'VIEWPORT_PAN': {
        draft.viewport.offsetX += action.payload.deltaX;
        draft.viewport.offsetY += action.payload.deltaY;
        break;
      }
      
      case 'VIEWPORT_ZOOM': {
        const { delta, centerX, centerY } = action.payload;
        const newScale = Math.max(
          draft.viewport.minScale,
          Math.min(draft.viewport.maxScale, draft.viewport.scale * delta)
        );
        
        // Zoom toward mouse position
        const scaleDiff = newScale - draft.viewport.scale;
        draft.viewport.offsetX -= centerX * scaleDiff / draft.viewport.scale;
        draft.viewport.offsetY -= centerY * scaleDiff / draft.viewport.scale;
        draft.viewport.scale = newScale;
        break;
      }
      
      case 'VIEWPORT_RESET': {
        draft.viewport = DEFAULT_VIEWPORT;
        break;
      }
      
      case 'SETTINGS_UPDATE': {
        if (draft.currentProject) {
          Object.assign(draft.currentProject.settings, action.payload);
          draft.currentProject.updatedAt = new Date().toISOString();
        }
        break;
      }
      
      // SELECTION
      case 'SELECTION_SET': {
        draft.selectedElementIds = new Set(action.payload.ids);
        break;
      }
      
      case 'SELECTION_CLEAR': {
        draft.selectedElementIds = new Set();
        break;
      }
      
      // INTERACTION
      case 'DRAW_START': {
        draft.isDrawing = true;
        draft.drawStartNodeId = action.payload.nodeId;
        break;
      }
      
      case 'DRAW_END': {
        draft.isDrawing = false;
        draft.drawStartNodeId = null;
        break;
      }
      
      case 'HOVER_UPDATE': {
        draft.hoverPoint = action.payload.point;
        draft.hoverElementId = action.payload.elementId;
        break;
      }
      
      // PERSISTENCE
      case 'SAVE_START': {
        draft.isSaving = true;
        break;
      }
      
      case 'SAVE_COMPLETE': {
        draft.isSaving = false;
        draft.lastSaveTime = action.payload.time;
        draft.saveError = action.payload.error;
        break;
      }
    }
  });
}