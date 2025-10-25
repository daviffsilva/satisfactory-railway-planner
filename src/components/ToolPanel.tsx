import React, { useRef } from 'react';
import { ToolType } from '../App';
import './ToolPanel.css';

interface ToolPanelProps {
  selectedTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  onClearAll: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedTool,
  onToolSelect,
  onClearAll,
  onSave,
  onLoad
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: 'select', label: 'Select', icon: '↖' },
    { type: 'track', label: 'Track', icon: '━' },
    { type: 'block-signal', label: 'Block Signal', icon: '🔵' },
    { type: 'path-signal', label: 'Path Signal', icon: '🟢' },
    { type: 'delete', label: 'Delete', icon: '🗑️' }
  ];

  return (
    <div className="tool-panel">
      <div className="panel-header">
        <h2>Satisfactory Railway Planner</h2>
        <p>Design your railway network</p>
      </div>

      <div className="tools-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.type}
              className={`tool-button ${selectedTool === tool.type ? 'active' : ''}`}
              onClick={() => onToolSelect(tool.type)}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="instructions-section">
        <h3>Instructions</h3>
        <div className="instructions">
          {selectedTool === 'select' && (
            <p>Click and drag to select multiple items</p>
          )}
          {selectedTool === 'track' && (
            <p>Click and drag to place railway tracks. Tracks snap to grid.</p>
          )}
          {selectedTool === 'block-signal' && (
            <p>Click on tracks to place block signals. Blue signals control train movement.</p>
          )}
          {selectedTool === 'path-signal' && (
            <p>Click on tracks to place path signals. Green signals allow multiple trains.</p>
          )}
          {selectedTool === 'delete' && (
            <p>Click on tracks or signals to delete them.</p>
          )}
        </div>
      </div>

      <div className="file-section">
        <h3>File Operations</h3>
        <div className="file-buttons">
          <button className="file-button" onClick={onSave}>
            💾 Save Design
          </button>
          <button 
            className="file-button" 
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Load Design
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onLoad}
            style={{ display: 'none' }}
          />
          <button className="file-button danger" onClick={onClearAll}>
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="info-section">
        <h3>About</h3>
        <p>
          This tool helps you plan railway networks for Satisfactory. 
          Design your tracks and signals before building in-game.
        </p>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color track"></div>
            <span>Railway Track</span>
          </div>
          <div className="legend-item">
            <div className="legend-color block-signal"></div>
            <span>Block Signal</span>
          </div>
          <div className="legend-item">
            <div className="legend-color path-signal"></div>
            <span>Path Signal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPanel;

