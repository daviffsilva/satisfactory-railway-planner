import React from 'react';
import { ToolType } from '../types/state';
import { Project } from '../types/railway';
import { Action } from '../state/actions';
import './ToolPanel.css';

interface ToolPanelProps {
  selectedTool: ToolType;
  currentProject: Project | null;
  lastSaveTime: number | null;
  saveError: string | null;
  dispatch: React.Dispatch<Action>;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedTool,
  currentProject,
  lastSaveTime,
  saveError,
  dispatch,
}) => {
  const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: 'select', label: 'Select', icon: '↖️' },
    { type: 'track', label: 'Track', icon: '━' },
    { type: 'signal', label: 'Signal', icon: '🔵' },
    { type: 'delete', label: 'Delete', icon: '🗑️' },
    { type: 'pan', label: 'Pan', icon: '✋' },
  ];

  const formatRelativeTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="tool-panel">
      <div className="panel-header">
        <h2>Satisfactory Railway Planner</h2>
        <p>Design your railway network</p>
      </div>

      {/* Project Info */}
      {currentProject && (
        <div className="project-info">
          <h3>{currentProject.name}</h3>
          <div className="project-stats">
            <div>Nodes: {currentProject.nodes.length}</div>
            <div>Segments: {currentProject.segments.length}</div>
          </div>
        </div>
      )}

      {/* Tools */}
      <div className="tools-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.type}
              className={`tool-button ${
                selectedTool === tool.type ? 'active' : ''
              }`}
              onClick={() =>
                dispatch({ type: 'TOOL_SELECT', payload: { tool: tool.type } })
              }
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Controls */}
      {currentProject && (
        <div className="grid-controls">
          <h3>Grid Settings</h3>
          <label>
            <input
              type="checkbox"
              checked={currentProject.settings.grid.visible}
              onChange={e =>
                dispatch({
                  type: 'SETTINGS_UPDATE',
                  payload: {
                    grid: {
                      ...currentProject.settings.grid,
                      visible: e.target.checked,
                    },
                  },
                })
              }
            />
            Show Grid
          </label>
          <label>
            <input
              type="checkbox"
              checked={currentProject.settings.grid.snapEnabled}
              onChange={e =>
                dispatch({
                  type: 'SETTINGS_UPDATE',
                  payload: {
                    grid: {
                      ...currentProject.settings.grid,
                      snapEnabled: e.target.checked,
                    },
                  },
                })
              }
            />
            Snap to Grid
          </label>
          <div className="grid-size">
            <label>Grid Size: {currentProject.settings.grid.size / 100}m</label>
          </div>
        </div>
      )}

      {/* Save Status */}
      {lastSaveTime && (
        <div className="save-status">
          {saveError ? (
            <span className="error">❌ {saveError}</span>
          ) : (
            <span className="success">
              ✅ Saved {formatRelativeTime(lastSaveTime)}
            </span>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="instructions-section">
        <h3>Instructions</h3>
        <div className="instructions">
          {selectedTool === 'select' && (
            <p>Click to select elements. Drag to move.</p>
          )}
          {selectedTool === 'track' && (
            <p>Click to place nodes and create tracks. Tracks snap to grid.</p>
          )}
          {selectedTool === 'signal' && (
            <p>Click on track segments to place block signals.</p>
          )}
          {selectedTool === 'delete' && (
            <p>Click on nodes, tracks, or signals to delete them.</p>
          )}
          {selectedTool === 'pan' && (
            <p>Drag to pan the view. Scroll to zoom.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolPanel;