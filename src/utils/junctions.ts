import { Node, Segment, Issue } from '../types/railway';

/**
 * Detect and validate junctions (nodes with degree >= 3)
 */
export function findJunctions(
  nodes: Node[],
  segments: Segment[]
): Node[] {
  const nodeDegrees = new Map<string, number>();
  
  // Count degree for each node
  for (const node of nodes) {
    nodeDegrees.set(node.id, 0);
  }
  
  for (const segment of segments) {
    nodeDegrees.set(segment.aNodeId, (nodeDegrees.get(segment.aNodeId) || 0) + 1);
    nodeDegrees.set(segment.bNodeId, (nodeDegrees.get(segment.bNodeId) || 0) + 1);
  }
  
  // Filter nodes with degree >= 3
  return nodes.filter(node => (nodeDegrees.get(node.id) || 0) >= 3);
}

/**
 * Validate junction geometry
 * Checks for:
 * - Minimum angle between segments
 * - Maximum number of branches
 * - Overlapping segments
 */
export function validateJunctionGeometry(
  junction: Node,
  segments: Segment[],
  nodeMap: Map<string, Node>,
  config: JunctionValidationConfig
): Issue[] {
  const issues: Issue[] = [];
  
  // Find all segments connected to this junction
  const connectedSegments = segments.filter(
    s => s.aNodeId === junction.id || s.bNodeId === junction.id
  );
  
  // Check branch count
  if (connectedSegments.length > config.maxBranches) {
    issues.push({
      id: crypto.randomUUID(),
      severity: 'warning',
      type: 'junction_too_complex',
      elementIds: [junction.id],
      message: `Junction has ${connectedSegments.length} branches (max: ${config.maxBranches})`,
      position: { x: junction.x, y: junction.y },
    });
  }
  
  // Check angles between segments
  const angles = computeSegmentAngles(junction, connectedSegments, nodeMap);
  
  for (let i = 0; i < angles.length; i++) {
    for (let j = i + 1; j < angles.length; j++) {
      const angleDiff = Math.abs(angles[i] - angles[j]);
      const normalizedAngle = Math.min(angleDiff, 2 * Math.PI - angleDiff);
      
      if (normalizedAngle < config.minAngleRadians) {
        issues.push({
          id: crypto.randomUUID(),
          severity: 'error',
          type: 'junction_angle_too_small',
          elementIds: [junction.id],
          message: `Junction has segments with angle < ${(config.minAngleRadians * 180 / Math.PI).toFixed(0)}°`,
          position: { x: junction.x, y: junction.y },
        });
      }
    }
  }
  
  return issues;
}

export interface JunctionValidationConfig {
  minAngleRadians: number;  // Default: 30° = 0.524 rad
  maxBranches: number;      // Default: 4
  overlapTolerance: number; // Default: 100 cm
}

export const DEFAULT_JUNCTION_CONFIG: JunctionValidationConfig = {
  minAngleRadians: Math.PI / 6, // 30 degrees
  maxBranches: 4,
  overlapTolerance: 100,
};

/**
 * Compute angles of all segments at a junction
 */
function computeSegmentAngles(
  junction: Node,
  segments: Segment[],
  nodeMap: Map<string, Node>
): number[] {
  const angles: number[] = [];
  
  for (const segment of segments) {
    // Find the other end of the segment
    const otherNodeId = segment.aNodeId === junction.id
      ? segment.bNodeId
      : segment.aNodeId;
    const otherNode = nodeMap.get(otherNodeId);
    
    if (!otherNode) continue;
    
    // Compute angle from junction to other node
    const dx = otherNode.x - junction.x;
    const dy = otherNode.y - junction.y;
    const angle = Math.atan2(dy, dx);
    
    angles.push(angle);
  }
  
  return angles;
}

/**
 * Auto-update node type based on degree
 */
export function updateNodeTypes(
  nodes: Node[],
  segments: Segment[]
): Node[] {
  const nodeDegrees = new Map<string, number>();
  
  // Count degree for each node
  for (const node of nodes) {
    nodeDegrees.set(node.id, 0);
  }
  
  for (const segment of segments) {
    nodeDegrees.set(segment.aNodeId, (nodeDegrees.get(segment.aNodeId) || 0) + 1);
    nodeDegrees.set(segment.bNodeId, (nodeDegrees.get(segment.bNodeId) || 0) + 1);
  }
  
  // Update node types
  return nodes.map(node => {
    const degree = nodeDegrees.get(node.id) || 0;
    
    let type: Node['type'] = 'regular';
    if (degree >= 3) {
      type = 'junction';
    } else if (degree === 1) {
      type = 'regular';
    }
    
    // Preserve stationAnchor type
    if (node.type === 'stationAnchor') {
      type = 'stationAnchor';
    }
    
    return { ...node, type };
  });
}
