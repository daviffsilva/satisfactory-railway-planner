import { Project, ProjectSettings } from '../types/railway';
import { serializeProject, deserializeProject } from './serialization';

const STORAGE_KEYS = {
  PROJECTS: 'satisfactory-railway-projects',
  CURRENT_PROJECT_ID: 'satisfactory-railway-current-project-id',
  SETTINGS: 'satisfactory-railway-settings',
};

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
}

/**
 * Save project to LocalStorage
 */
export function saveProject(
  project: Project
): { success: boolean; error?: string } {
  try {
    // Get all project metadata
    const metadataList = loadProjectMetadataList();
    
    // Update or add this project's metadata
    const metaIndex = metadataList.findIndex(m => m.id === project.id);
    const metadata: ProjectMetadata = {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      schemaVersion: project.schemaVersion,
    };
    
    if (metaIndex >= 0) {
      metadataList[metaIndex] = metadata;
    } else {
      metadataList.push(metadata);
    }
    
    // Save project
    const serialized = serializeProject(project);
    localStorage.setItem(`project-${project.id}`, serialized);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(metadataList));
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_ID, project.id);
    
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'Storage quota exceeded. Please delete old projects.',
      };
    }
    return {
      success: false,
      error: `Failed to save: ${error}`,
    };
  }
}

/**
 * Load project from LocalStorage
 */
export function loadProject(projectId: string): Project | null {
  try {
    const data = localStorage.getItem(`project-${projectId}`);
    if (!data) return null;
    
    return deserializeProject(data);
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

/**
 * Get list of all projects (metadata only)
 */
export function loadProjectMetadataList(): ProjectMetadata[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Delete project
 */
export function deleteProject(projectId: string): void {
  localStorage.removeItem(`project-${projectId}`);
  
  const metadataList = loadProjectMetadataList();
  const filtered = metadataList.filter(m => m.id !== projectId);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
}

/**
 * Save settings
 */
export function saveSettings(settings: ProjectSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Load settings
 */
export function loadSettings(): ProjectSettings | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Export project as downloadable JSON file
 */
export function exportProjectToFile(project: Project): void {
  const json = serializeProject(project);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '-')}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Import project from file
 */
export function importProjectFromFile(
  file: File
): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const project = deserializeProject(json);
        resolve(project);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}