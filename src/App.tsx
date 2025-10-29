import React, { useReducer, useEffect } from 'react';
import RailwayMap from './components/RailwayMap';
import ToolPanel from './components/ToolPanel';
import IssuesPanel from './components/IssuesPanel';
import ProjectManager from './components/ProjectManager';
import UndoRedoToolbar from './components/UndoRedoToolbar';
import BlockViewer from './components/BlockViewer';
import { reducer, initialState } from './state/reducer';
import { validateProject } from './utils/validation';
import { saveProject, loadProject, loadProjectMetadataList } from './utils/localStorage';
import { computeBlocks } from './utils/blocks';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize with a default project or load last project
  useEffect(() => {
    const metadataList = loadProjectMetadataList();
    if (metadataList.length > 0) {
      // Load last project
      const lastProject = loadProject(metadataList[0].id);
      if (lastProject) {
        dispatch({ type: 'PROJECT_LOAD', payload: { project: lastProject } });
        return;
      }
    }
    
    // Create default project
    dispatch({
      type: 'PROJECT_NEW',
      payload: { name: 'My Railway Network' },
    });
  }, []);

  // Validation effect (P1 + P2)
  useEffect(() => {
    if (!state.currentProject) return;

    const timeoutId = setTimeout(() => {
      const issues = validateProject(state.currentProject);
      dispatch({ type: 'VALIDATION_COMPLETE', payload: { issues } });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state.currentProject]);

  // Block computation effect (P2)
  useEffect(() => {
    if (!state.currentProject) return;

    const timeoutId = setTimeout(() => {
      const blocks = computeBlocks(
        state.currentProject.segments,
        state.currentProject.signals,
        state.currentProject.nodes
      );
      dispatch({ type: 'BLOCKS_COMPUTE', payload: { blocks } });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state.currentProject?.segments, state.currentProject?.signals, state.currentProject?.nodes]);

  // Autosave effect
  useEffect(() => {
    if (!state.currentProject) return;

    const timeoutId = setTimeout(() => {
      dispatch({ type: 'SAVE_START' });

      const result = saveProject(state.currentProject);

      dispatch({
        type: 'SAVE_COMPLETE',
        payload: {
          time: Date.now(),
          error: result.success ? null : result.error || 'Unknown error',
        },
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [state.currentProject]);

  return (
    <div className="app">
      <div className="app-header">
        <ProjectManager currentProject={state.currentProject} dispatch={dispatch} />
        <UndoRedoToolbar commandHistory={state.commandHistory} dispatch={dispatch} />
      </div>
      <div className="app-body">
        <div className="left-panel">
          <ToolPanel
            selectedTool={state.selectedTool}
            currentProject={state.currentProject}
            lastSaveTime={state.lastSaveTime}
            saveError={state.saveError}
            showBlockView={state.showBlockView}
            dispatch={dispatch}
          />
          {state.showBlockView && (
            <BlockViewer
              blocks={state.blocks}
              selectedBlockId={state.selectedBlockId}
              onBlockSelect={(blockId) => dispatch({ type: 'BLOCK_SELECT', payload: { blockId } })}
            />
          )}
        </div>
        <RailwayMap state={state} dispatch={dispatch} />
        <IssuesPanel issues={state.issues} dispatch={dispatch} />
      </div>
    </div>
  );
}

export default App;
