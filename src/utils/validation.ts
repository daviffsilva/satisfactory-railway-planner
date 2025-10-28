import { Project, Issue } from '../types/railway';
import { findSelfIntersections, findDuplicateSegments } from './geometry';
import { findOrphanedTracks } from './graph';

/**
 * Run all validation checks on a project
 */
export function validateProject(project: Project): Issue[] {
  const issues: Issue[] = [];
  
  // Build node map for efficient lookups
  const nodeMap = new Map(project.nodes.map(n => [n.id, n]));
  
  // Run validation checks
  issues.push(...findSelfIntersections(project.segments, nodeMap));
  issues.push(...findDuplicateSegments(project.segments));
  issues.push(...findOrphanedTracks(project.nodes, project.segments));
  
  return issues;
}