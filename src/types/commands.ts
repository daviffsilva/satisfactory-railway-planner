import { AppState } from './state';

/**
 * Command pattern for undo/redo
 * Each command encapsulates a state change and its inverse
 */
export interface Command {
  id: string;
  type: string;
  timestamp: number;
  
  /**
   * Apply this command to the state
   */
  execute(state: AppState): AppState;
  
  /**
   * Reverse this command on the state
   */
  undo(state: AppState): AppState;
  
  /**
   * Description for UI display
   */
  describe(): string;
}

/**
 * Command history manager
 */
export interface CommandHistory {
  undoStack: Command[];
  redoStack: Command[];
  maxSize: number;        // Maximum number of commands to keep
  maxMemoryMB: number;    // Maximum memory usage estimate
}
