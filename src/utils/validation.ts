import { Project, Issue } from '../types/railway';
import { findSelfIntersections, findDuplicateSegments } from './geometry';
import { findOrphanedTracks } from './graph';
import { findSignalOverlaps, findSignalConflicts } from './signalPlacement';
import { findMegaBlocks } from './blocks';

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
  
  // Signal validation
  issues.push(...findSignalOverlaps(project.signals, 200)); // 2m minimum distance
  issues.push(...findSignalConflicts(project.signals));
  
  return issues;
}

/**
 * Run validation specifically for blocks
 */
export function validateBlocks(project: Project, blocks: any[]): Issue[] {
  const issues: Issue[] = [];
  
  // Check for mega-blocks
  issues.push(...findMegaBlocks(blocks, project.segments, project.nodes));
  
  return issues;
}