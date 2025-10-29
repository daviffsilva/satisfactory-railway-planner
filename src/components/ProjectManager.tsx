import React, { useRef } from 'react';
import { Action } from '../state/actions';
import {
  exportProjectToFile,
  importProjectFromFile,
} from '../utils/localStorage';
import { Project } from '../types/railway';
import './ProjectManager.css';

interface ProjectManagerProps {
  currentProject: Project | null;
  dispatch: React.Dispatch<Action>;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  currentProject,
  dispatch,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewProject = () => {
    const name = prompt('Enter project name:', 'New Railway Network');
    if (name) {
      dispatch({ type: 'PROJECT_NEW', payload: { name } });
    }
  };

  const handleExport = () => {
    if (currentProject) {
      exportProjectToFile(currentProject);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const project = await importProjectFromFile(file);
        dispatch({ type: 'PROJECT_LOAD', payload: { project } });
      } catch (error) {
        alert(`Failed to import project: ${error}`);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="project-manager">
      <button className="project-button" onClick={handleNewProject}>
        📄 New Project
      </button>
      <button
        className="project-button"
        onClick={handleExport}
        disabled={!currentProject}
      >
        💾 Export
      </button>
      <button
        className="project-button"
        onClick={() => fileInputRef.current?.click()}
      >
        📁 Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ProjectManager;
