import { Point, Segment, Node, Issue } from '../types/railway';

/**
 * Check if two line segments intersect (excluding endpoints)
 */
export function segmentsIntersect(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point
): boolean {
  const det = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
  
  if (Math.abs(det) < 1e-10) {
    return false; // Parallel or coincident
  }
  
  const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / det;
  const u = ((b1.x - a1.x) * (a2.y - a1.y) - (b1.y - a1.y) * (a2.x - a1.x)) / det;
  
  // Intersect if both t and u are in (0, 1) - excludes endpoints
  return t > 0 && t < 1 && u > 0 && u < 1;
}

/**
 * Compute intersection point of two line segments
 */
export function computeIntersectionPoint(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point
): Point | null {
  const det = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
  
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  
  const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / det;
  
  return {
    x: a1.x + t * (a2.x - a1.x),
    y: a1.y + t * (a2.y - a1.y),
  };
}

/**
 * Find all self-intersections in the segment list
 */
export function findSelfIntersections(
  segments: Segment[],
  nodeMap: Map<string, Node>
): Issue[] {
  const issues: Issue[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const seg1 = segments[i];
      const seg2 = segments[j];
      
      // Skip if segments share a node (allowed intersection)
      if (
        seg1.aNodeId === seg2.aNodeId ||
        seg1.aNodeId === seg2.bNodeId ||
        seg1.bNodeId === seg2.aNodeId ||
        seg1.bNodeId === seg2.bNodeId
      ) {
        continue;
      }
      
      const a1 = nodeMap.get(seg1.aNodeId);
      const a2 = nodeMap.get(seg1.bNodeId);
      const b1 = nodeMap.get(seg2.aNodeId);
      const b2 = nodeMap.get(seg2.bNodeId);
      
      if (!a1 || !a2 || !b1 || !b2) continue;
      
      if (segmentsIntersect(a1, a2, b1, b2)) {
        const position = computeIntersectionPoint(a1, a2, b1, b2);
        
        issues.push({
          id: crypto.randomUUID(),
          severity: 'error',
          type: 'self_intersection',
          elementIds: [seg1.id, seg2.id],
          message: `Segments intersect without a shared node`,
          position: position || undefined,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Find duplicate segments (same nodes, regardless of order)
 */
export function findDuplicateSegments(segments: Segment[]): Issue[] {
  const issues: Issue[] = [];
  const seen = new Map<string, string>(); // key -> segmentId
  
  for (const seg of segments) {
    // Create normalized key (order-independent)
    const key = [seg.aNodeId, seg.bNodeId].sort().join('::');
    
    if (seen.has(key)) {
      const originalId = seen.get(key)!;
      issues.push({
        id: crypto.randomUUID(),
        severity: 'error',
        type: 'duplicate_segment',
        elementIds: [originalId, seg.id],
        message: `Duplicate segment between same nodes`,
        position: undefined,
      });
    } else {
      seen.set(key, seg.id);
    }
  }
  
  return issues;
}

/**
 * Calculate segment length
 */
export function calculateSegmentLength(
  segment: Segment,
  nodeMap: Map<string, Node>
): number {
  const a = nodeMap.get(segment.aNodeId);
  const b = nodeMap.get(segment.bNodeId);
  
  if (!a || !b) return 0;
  
  return Math.hypot(b.x - a.x, b.y - a.y);
}