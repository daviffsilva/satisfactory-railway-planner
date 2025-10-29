import { Project, Issue } from '../types/railway';
import { findSelfIntersections, findDuplicateSegments } from './geometry';
import { findOrphanedTracks } from './graph';
import { findSignalOverlaps, findSignalConflicts } from './signalPlacement';
import { findMegaBlocks } from './blocks';
import { findJunctions, validateJunctionGeometry, DEFAULT_JUNCTION_CONFIG } from './junctions';
import { validateBezierCurve } from './curves';

/**
 * Run all validation checks on a project (P1 + P2)
 */
export function validateProject(project: Project): Issue[] {
  const issues: Issue[] = [];
  
  // Build node map for efficient lookups
  const nodeMap = new Map(project.nodes.map(n => [n.id, n]));
  
  // P1 validation checks
  issues.push(...findSelfIntersections(project.segments, nodeMap));
  issues.push(...findDuplicateSegments(project.segments));
  issues.push(...findOrphanedTracks(project.nodes, project.segments));
  
  // P2 validation checks
  // Signal validation
  issues.push(...findSignalOverlaps(project.signals));
  issues.push(...findSignalConflicts(project.signals));
  
  // Junction validation
  const junctions = findJunctions(project.nodes, project.segments);
  for (const junction of junctions) {
    issues.push(...validateJunctionGeometry(junction, project.segments, nodeMap, DEFAULT_JUNCTION_CONFIG));
  }
  
  // Curve validation
  for (const segment of project.segments) {
    if (segment.geometry === 'bezier') {
      issues.push(...validateBezierCurve(segment, nodeMap));
    }
  }
  
  return issues;
}
