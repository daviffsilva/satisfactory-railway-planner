import { Signal, Segment, Node, Issue } from '../types/railway';

/**
 * Compute world position of a signal on its segment
 */
export function computeSignalPosition(
  signal: Signal,
  segment: Segment,
  nodeMap: Map<string, Node>
): { x: number; y: number } | null {
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  
  if (!nodeA || !nodeB) return null;
  
  if (segment.geometry === 'straight') {
    return {
      x: nodeA.x + (nodeB.x - nodeA.x) * signal.offsetT,
      y: nodeA.y + (nodeB.y - nodeA.y) * signal.offsetT,
    };
  } else {
    // Bezier curve - will be implemented in curves.ts
    return computeSignalPositionOnCurve(signal, segment, nodeMap);
  }
}

/**
 * Find nearest point on segment to world position
 * Returns offsetT value [0, 1]
 */
export function findNearestPointOnSegment(
  worldPos: { x: number; y: number },
  segment: Segment,
  nodeMap: Map<string, Node>
): number {
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  
  if (!nodeA || !nodeB) return 0.5;
  
  if (segment.geometry === 'straight') {
    // Vector from A to B
    const abx = nodeB.x - nodeA.x;
    const aby = nodeB.y - nodeA.y;
    
    // Vector from A to point
    const apx = worldPos.x - nodeA.x;
    const apy = worldPos.y - nodeA.y;
    
    // Project point onto line
    const ab2 = abx * abx + aby * aby;
    const ap_ab = apx * abx + apy * aby;
    
    let t = ap_ab / ab2;
    t = Math.max(0, Math.min(1, t)); // Clamp to [0, 1]
    
    return t;
  } else {
    // Bezier curve - will be implemented in curves.ts
    return findNearestPointOnCurve(worldPos, segment, nodeMap);
  }
}

/**
 * Detect overlapping signals on the same segment
 */
export function findSignalOverlaps(
  signals: Signal[],
  minDistance: number = 0.01 // 1% of segment
): Issue[] {
  const issues: Issue[] = [];
  
  // Group signals by segment
  const signalsBySegment = new Map<string, Signal[]>();
  for (const signal of signals) {
    if (!signalsBySegment.has(signal.segmentId)) {
      signalsBySegment.set(signal.segmentId, []);
    }
    signalsBySegment.get(signal.segmentId)!.push(signal);
  }
  
  // Check for overlaps within each segment
  for (const [segmentId, segmentSignals] of signalsBySegment) {
    for (let i = 0; i < segmentSignals.length; i++) {
      for (let j = i + 1; j < segmentSignals.length; j++) {
        const sig1 = segmentSignals[i];
        const sig2 = segmentSignals[j];
        
        // Compute distance along segment
        const distance = Math.abs(sig1.offsetT - sig2.offsetT);
        
        if (distance < minDistance) {
          issues.push({
            id: crypto.randomUUID(),
            severity: 'warning',
            type: 'signal_overlap',
            elementIds: [sig1.id, sig2.id],
            message: `Signals are too close together on segment`,
          });
        }
      }
    }
  }
  
  return issues;
}

/**
 * Detect conflicting signal directions (deadlock situations)
 */
export function findSignalConflicts(
  signals: Signal[]
): Issue[] {
  const issues: Issue[] = [];
  
  // Group signals by segment
  const signalsBySegment = new Map<string, Signal[]>();
  for (const signal of signals) {
    if (!signalsBySegment.has(signal.segmentId)) {
      signalsBySegment.set(signal.segmentId, []);
    }
    signalsBySegment.get(signal.segmentId)!.push(signal);
  }
  
  // Check for conflicting orientations
  for (const [segmentId, segmentSignals] of signalsBySegment) {
    const hasAtoB = segmentSignals.some(s => s.orientation === 'AtoB');
    const hasBtoA = segmentSignals.some(s => s.orientation === 'BtoA');
    
    if (hasAtoB && hasBtoA) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'error',
        type: 'signal_conflict',
        elementIds: segmentSignals.map(s => s.id),
        message: `Conflicting signal directions create deadlock`,
      });
    }
  }
  
  return issues;
}

/**
 * Helper for curved segments (stub for now, implemented in curves.ts)
 */
function computeSignalPositionOnCurve(
  signal: Signal,
  segment: Segment,
  nodeMap: Map<string, Node>
): { x: number; y: number } | null {
  // Will be implemented when curves are added
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  if (!nodeA || !nodeB) return null;
  
  // Fallback to straight line
  return {
    x: nodeA.x + (nodeB.x - nodeA.x) * signal.offsetT,
    y: nodeA.y + (nodeB.y - nodeA.y) * signal.offsetT,
  };
}

function findNearestPointOnCurve(
  worldPos: { x: number; y: number },
  segment: Segment,
  nodeMap: Map<string, Node>
): number {
  // Will be implemented when curves are added
  return 0.5;
}
