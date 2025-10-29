import { Point, Segment, Node, Issue } from '../types/railway';

/**
 * Quadratic Bezier curve utilities
 * 
 * Curve defined by:
 * - P0: Start point (nodeA)
 * - P1: Control point
 * - P2: End point (nodeB)
 * 
 * Parametric equation: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2, t ∈ [0,1]
 */

/**
 * Evaluate point on quadratic Bezier curve at parameter t
 */
export function evaluateBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  t: number
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  
  return {
    x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
    y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y,
  };
}

/**
 * Compute control point from segment metadata
 */
export function getControlPoint(
  segment: Segment,
  nodeMap: Map<string, Node>
): Point | null {
  if (segment.geometry !== 'bezier') return null;
  
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  if (!nodeA || !nodeB) return null;
  
  // Control point stored in metadata
  if (segment.metadata?.controlPoint) {
    return segment.metadata.controlPoint;
  }
  
  // Default: midpoint slightly offset perpendicular
  const midX = (nodeA.x + nodeB.x) / 2;
  const midY = (nodeA.y + nodeB.y) / 2;
  
  // Perpendicular offset
  const dx = nodeB.x - nodeA.x;
  const dy = nodeB.y - nodeA.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return { x: midX, y: midY };
  
  const offsetDistance = length * 0.2; // 20% of segment length
  const perpX = -dy / length * offsetDistance;
  const perpY = dx / length * offsetDistance;
  
  return {
    x: midX + perpX,
    y: midY + perpY,
  };
}

/**
 * Update segment with new control point
 */
export function setControlPoint(
  segment: Segment,
  controlPoint: Point
): Segment {
  return {
    ...segment,
    geometry: 'bezier',
    metadata: {
      ...segment.metadata,
      controlPoint,
    },
  };
}

/**
 * Render Bezier curve on canvas
 */
export function renderBezierSegment(
  ctx: CanvasRenderingContext2D,
  segment: Segment,
  nodeMap: Map<string, Node>
): void {
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  const controlPoint = getControlPoint(segment, nodeMap);
  
  if (!nodeA || !nodeB || !controlPoint) return;
  
  ctx.beginPath();
  ctx.moveTo(nodeA.x, nodeA.y);
  ctx.quadraticCurveTo(
    controlPoint.x,
    controlPoint.y,
    nodeB.x,
    nodeB.y
  );
  ctx.stroke();
}

/**
 * Render control point handles
 */
export function renderControlPointHandle(
  ctx: CanvasRenderingContext2D,
  controlPoint: Point,
  nodeA: Point,
  nodeB: Point,
  viewport: { scale: number }
): void {
  const handleRadius = 8 / viewport.scale;
  
  // Draw lines to endpoints
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1 / viewport.scale;
  ctx.setLineDash([5 / viewport.scale, 5 / viewport.scale]);
  
  ctx.beginPath();
  ctx.moveTo(nodeA.x, nodeA.y);
  ctx.lineTo(controlPoint.x, controlPoint.y);
  ctx.lineTo(nodeB.x, nodeB.y);
  ctx.stroke();
  
  ctx.setLineDash([]);
  
  // Draw handle
  ctx.fillStyle = '#00ff88';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 / viewport.scale;
  
  ctx.beginPath();
  ctx.arc(controlPoint.x, controlPoint.y, handleRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Find nearest point on Bezier curve to given point
 * Returns parameter t ∈ [0,1]
 */
export function findNearestPointOnBezier(
  point: Point,
  p0: Point,
  p1: Point,
  p2: Point,
  samples: number = 20
): number {
  let minDist = Infinity;
  let bestT = 0;
  
  // Sample curve at regular intervals
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const curvePoint = evaluateBezier(p0, p1, p2, t);
    const dist = Math.hypot(curvePoint.x - point.x, curvePoint.y - point.y);
    
    if (dist < minDist) {
      minDist = dist;
      bestT = t;
    }
  }
  
  // Refine using Newton's method (optional, for precision)
  // ... implementation omitted for brevity
  
  return bestT;
}

/**
 * Compute curve length using adaptive subdivision
 */
export function computeBezierLength(
  p0: Point,
  p1: Point,
  p2: Point,
  tolerance: number = 10 // centimeters
): number {
  return subdivideLength(p0, p1, p2, 0, 1, tolerance);
}

function subdivideLength(
  p0: Point,
  p1: Point,
  p2: Point,
  t0: number,
  t1: number,
  tolerance: number
): number {
  const point0 = evaluateBezier(p0, p1, p2, t0);
  const point1 = evaluateBezier(p0, p1, p2, t1);
  const pointMid = evaluateBezier(p0, p1, p2, (t0 + t1) / 2);
  
  // Distance via endpoints
  const linearDist = Math.hypot(point1.x - point0.x, point1.y - point0.y);
  
  // Distance via midpoint
  const curvedDist =
    Math.hypot(pointMid.x - point0.x, pointMid.y - point0.y) +
    Math.hypot(point1.x - pointMid.x, point1.y - pointMid.y);
  
  // If difference is small enough, return curved distance
  if (Math.abs(curvedDist - linearDist) < tolerance) {
    return curvedDist;
  }
  
  // Otherwise, subdivide
  return (
    subdivideLength(p0, p1, p2, t0, (t0 + t1) / 2, tolerance) +
    subdivideLength(p0, p1, p2, (t0 + t1) / 2, t1, tolerance)
  );
}

/**
 * Validate curve doesn't self-intersect
 */
export function validateBezierCurve(
  segment: Segment,
  nodeMap: Map<string, Node>
): Issue[] {
  const issues: Issue[] = [];
  
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  const controlPoint = getControlPoint(segment, nodeMap);
  
  if (!nodeA || !nodeB || !controlPoint) return issues;
  
  // Check if control point creates extreme curvature
  const segmentLength = Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y);
  const controlDistance = Math.min(
    Math.hypot(controlPoint.x - nodeA.x, controlPoint.y - nodeA.y),
    Math.hypot(controlPoint.x - nodeB.x, controlPoint.y - nodeB.y)
  );
  
  // If control point is too far from segment, curve may loop
  if (controlDistance > segmentLength * 2) {
    issues.push({
      id: crypto.randomUUID(),
      severity: 'warning',
      type: 'curve_extreme',
      elementIds: [segment.id],
      message: 'Curve has extreme curvature - may cause issues',
    });
  }
  
  return issues;
}

/**
 * Compute signal position on Bezier curve
 */
export function computeSignalPositionOnCurve(
  offsetT: number,
  segment: Segment,
  nodeMap: Map<string, Node>
): Point | null {
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  const controlPoint = getControlPoint(segment, nodeMap);
  
  if (!nodeA || !nodeB || !controlPoint) return null;
  
  return evaluateBezier(nodeA, controlPoint, nodeB, offsetT);
}

/**
 * Find nearest point on curve for signal placement
 */
export function findNearestPointOnCurve(
  worldPos: Point,
  segment: Segment,
  nodeMap: Map<string, Node>
): number {
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  const controlPoint = getControlPoint(segment, nodeMap);
  
  if (!nodeA || !nodeB || !controlPoint) return 0.5;
  
  return findNearestPointOnBezier(worldPos, nodeA, controlPoint, nodeB);
}
