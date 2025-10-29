import { Project } from '../types/railway';

/**
 * Serialize project for JSON export
 */
export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Deserialize project from JSON
 */
export function deserializeProject(json: string): Project {
  const data = JSON.parse(json);
  
  // Validate schema version
  if (!data.schemaVersion || !data.schemaVersion.startsWith('1.')) {
    throw new Error(`Unsupported schema version: ${data.schemaVersion}`);
  }
  
  // Validate required fields
  if (!data.id || !data.name || !data.nodes || !data.segments) {
    throw new Error('Invalid project structure');
  }
  
  return data as Project;
}
