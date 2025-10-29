import React, { useEffect } from 'react';
import { CommandHistory } from '../types/commands';
import { canUndo, canRedo } from '../state/commandHistory';
import { Action } from '../state/actions';
import './UndoRedoToolbar.css';

interface UndoRedoToolbarProps {
  commandHistory: CommandHistory;
  dispatch: React.Dispatch<Action>;
}

const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  commandHistory,
  dispatch,
}) => {
  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };
  
  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo(commandHistory)) {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo(commandHistory)) {
          handleRedo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandHistory]);
  
  return (
    <div className="undo-redo-toolbar">
      <button
        className="toolbar-button"
        onClick={handleUndo}
        disabled={!canUndo(commandHistory)}
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        className="toolbar-button"
        onClick={handleRedo}
        disabled={!canRedo(commandHistory)}
        title="Redo (Ctrl+Y)"
      >
        ↷ Redo
      </button>
      <span className="history-count">
        {commandHistory.undoStack.length} actions
      </span>
    </div>
  );
};

export default UndoRedoToolbar;
