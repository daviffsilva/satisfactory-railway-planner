import { Command, CommandHistory } from '../types/commands';
import { AppState } from '../types/state';

/**
 * Initialize empty command history
 */
export function createCommandHistory(): CommandHistory {
  return {
    undoStack: [],
    redoStack: [],
    maxSize: 100,
    maxMemoryMB: 50,
  };
}

/**
 * Execute a command and add it to history
 */
export function executeCommand(
  history: CommandHistory,
  command: Command,
  state: AppState
): { newState: AppState; newHistory: CommandHistory } {
  // Execute command
  const newState = command.execute(state);
  
  // Add to undo stack
  const newUndoStack = [...history.undoStack, command];
  
  // Clear redo stack (new action invalidates redo)
  const newRedoStack: Command[] = [];
  
  // Enforce size limits
  const trimmedUndoStack = trimStackToLimits(
    newUndoStack,
    history.maxSize,
    history.maxMemoryMB
  );
  
  return {
    newState,
    newHistory: {
      ...history,
      undoStack: trimmedUndoStack,
      redoStack: newRedoStack,
    },
  };
}

/**
 * Undo the last command
 */
export function undoCommand(
  history: CommandHistory,
  state: AppState
): { newState: AppState; newHistory: CommandHistory } | null {
  if (history.undoStack.length === 0) return null;
  
  const command = history.undoStack[history.undoStack.length - 1];
  const newState = command.undo(state);
  
  const newUndoStack = history.undoStack.slice(0, -1);
  const newRedoStack = [...history.redoStack, command];
  
  return {
    newState,
    newHistory: {
      ...history,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    },
  };
}

/**
 * Redo the last undone command
 */
export function redoCommand(
  history: CommandHistory,
  state: AppState
): { newState: AppState; newHistory: CommandHistory } | null {
  if (history.redoStack.length === 0) return null;
  
  const command = history.redoStack[history.redoStack.length - 1];
  const newState = command.execute(state);
  
  const newRedoStack = history.redoStack.slice(0, -1);
  const newUndoStack = [...history.undoStack, command];
  
  return {
    newState,
    newHistory: {
      ...history,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    },
  };
}

/**
 * Trim stack to size and memory limits
 */
function trimStackToLimits(
  stack: Command[],
  maxSize: number,
  maxMemoryMB: number
): Command[] {
  // Trim to max size
  if (stack.length > maxSize) {
    stack = stack.slice(stack.length - maxSize);
  }
  
  // Estimate memory usage (rough approximation)
  // Each command ~1KB average
  const estimatedMB = (stack.length * 1) / 1024;
  
  if (estimatedMB > maxMemoryMB) {
    const targetLength = Math.floor((maxMemoryMB * 1024) / 1);
    stack = stack.slice(stack.length - targetLength);
  }
  
  return stack;
}

/**
 * Check if undo is available
 */
export function canUndo(history: CommandHistory): boolean {
  return history.undoStack.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo(history: CommandHistory): boolean {
  return history.redoStack.length > 0;
}
