import { Node, Segment, Issue, Signal, Block } from '../types/railway';
import { Viewport } from '../types/state';
import { screenToWorld } from './coordinates';
import { computeSignalPosition } from './signalPlacement';

/**
 * Render grid overlay
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  gridSize: number,
  opacity: number
): void {
  const canvas = ctx.canvas;
  
  // Compute visible world bounds
  const topLeft = screenToWorld(0, 0, viewport);
  const bottomRight = screenToWorld(canvas.width, canvas.height, viewport);
  
  // Round to grid boundaries
  const startX = Math.floor(topLeft.x / gridSize) * gridSize;
  const startY = Math.floor(topLeft.y / gridSize) * gridSize;
  const endX = Math.ceil(bottomRight.x / gridSize) * gridSize;
  const endY = Math.ceil(bottomRight.y / gridSize) * gridSize;
  
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = 1 / viewport.scale;
  
  // Vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
}

/**
 * Render segments
 */
export function renderSegments(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  nodeMap: Map<string, Node>,
  selectedIds: Set<string>,
  hoveredId: string | null,
  viewport: Viewport
): void {
  for (const seg of segments) {
    const nodeA = nodeMap.get(seg.aNodeId);
    const nodeB = nodeMap.get(seg.bNodeId);
    if (!nodeA || !nodeB) continue;
    
    const isSelected = selectedIds.has(seg.id);
    const isHovered = hoveredId === seg.id;
    
    ctx.strokeStyle = isSelected
      ? '#ffcc00'
      : isHovered
      ? '#ff9900'
      : '#ff6b35';
    ctx.lineWidth = (isSelected || isHovered ? 4 : 3) / viewport.scale;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(nodeA.x, nodeA.y);
    ctx.lineTo(nodeB.x, nodeB.y);
    ctx.stroke();
  }
}

/**
 * Render nodes
 */
export function renderNodes(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  selectedIds: Set<string>,
  hoveredId: string | null,
  viewport: Viewport
): void {
  const nodeRadius = 6 / viewport.scale;
  
  for (const node of nodes) {
    const isSelected = selectedIds.has(node.id);
    const isHovered = hoveredId === node.id;
    
    // Fill
    ctx.fillStyle = isSelected
      ? '#ffcc00'
      : isHovered
      ? '#ff9900'
      : '#ffffff';
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1 / viewport.scale;
    ctx.stroke();
  }
}

/**
 * Render issues
 */
export function renderIssues(
  ctx: CanvasRenderingContext2D,
  issues: Issue[],
  viewport: Viewport
): void {
  for (const issue of issues) {
    if (!issue.position) continue;
    
    const radius = 12 / viewport.scale;
    const color = issue.severity === 'error' ? '#ff3333' : '#ffaa00';
    
    // Circle
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(issue.position.x, issue.position.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.font = `${16 / viewport.scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', issue.position.x, issue.position.y);
  }
}

/**
 * Render signals on segments
 */
export function renderSignals(
  ctx: CanvasRenderingContext2D,
  signals: Signal[],
  segmentMap: Map<string, Segment>,
  nodeMap: Map<string, Node>,
  selectedIds: Set<string>,
  hoveredId: string | null,
  viewport: Viewport
): void {
  for (const signal of signals) {
    const segment = segmentMap.get(signal.segmentId);
    if (!segment) continue;
    
    const position = computeSignalPosition(signal, segment, nodeMap);
    if (!position) continue;
    
    const isSelected = selectedIds.has(signal.id);
    const isHovered = hoveredId === signal.id;
    
    // Signal base (circle or square)
    const size = 10 / viewport.scale;
    const color = signal.type === 'block' ? '#4a9eff' : '#00ff88';
    
    ctx.fillStyle = isSelected
      ? '#ffcc00'
      : isHovered
      ? '#ff9900'
      : color;
    
    if (signal.type === 'block') {
      // Block signal: square
      ctx.fillRect(
        position.x - size / 2,
        position.y - size / 2,
        size,
        size
      );
    } else {
      // Path signal: circle (P3 feature)
      ctx.beginPath();
      ctx.arc(position.x, position.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 / viewport.scale;
    if (signal.type === 'block') {
      ctx.strokeRect(
        position.x - size / 2,
        position.y - size / 2,
        size,
        size
      );
    } else {
      ctx.beginPath();
      ctx.arc(position.x, position.y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Direction indicator
    renderSignalDirection(ctx, signal, position, segment, nodeMap, viewport);
  }
}

/**
 * Render signal direction arrow
 */
function renderSignalDirection(
  ctx: CanvasRenderingContext2D,
  signal: Signal,
  position: { x: number; y: number },
  segment: Segment,
  nodeMap: Map<string, Node>,
  viewport: Viewport
): void {
  const nodeA = nodeMap.get(segment.aNodeId);
  const nodeB = nodeMap.get(segment.bNodeId);
  if (!nodeA || !nodeB) return;
  
  // Calculate direction along segment
  const dx = nodeB.x - nodeA.x;
  const dy = nodeB.y - nodeA.y;
  const angle = Math.atan2(dy, dx);
  
  const arrowSize = 8 / viewport.scale;
  
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2 / viewport.scale;
  
  if (signal.orientation === 'AtoB') {
    // Arrow pointing from A to B
    drawArrow(ctx, position, angle, arrowSize);
  } else if (signal.orientation === 'BtoA') {
    // Arrow pointing from B to A
    drawArrow(ctx, position, angle + Math.PI, arrowSize);
  } else {
    // Bidirectional: two arrows
    drawArrow(ctx, position, angle, arrowSize / 1.5);
    drawArrow(ctx, position, angle + Math.PI, arrowSize / 1.5);
  }
}

/**
 * Draw arrow at position pointing in direction
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  position: { x: number; y: number },
  angle: number,
  size: number
): void {
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(0, -size / 2);
  ctx.lineTo(0, size / 2);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

/**
 * Render blocks with colored overlay
 */
export function renderBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: Block[],
  segments: Segment[],
  nodeMap: Map<string, Node>,
  selectedBlockId: string | null,
  viewport: Viewport
): void {
  const segmentMap = new Map(segments.map(s => [s.id, s]));
  
  for (const block of blocks) {
    const isSelected = selectedBlockId === block.id;
    
    // Set block color with transparency
    ctx.globalAlpha = isSelected ? 0.4 : 0.2;
    ctx.strokeStyle = block.color;
    ctx.lineWidth = (isSelected ? 8 : 6) / viewport.scale;
    ctx.lineCap = 'round';
    
    // Draw each segment in the block
    for (const segmentId of block.segmentIds) {
      const segment = segmentMap.get(segmentId);
      if (!segment) continue;
      
      const nodeA = nodeMap.get(segment.aNodeId);
      const nodeB = nodeMap.get(segment.bNodeId);
      if (!nodeA || !nodeB) continue;
      
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.lineTo(nodeB.x, nodeB.y);
      ctx.stroke();
    }
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Render draw preview (while creating track)
 */
export function renderDrawPreview(
  ctx: CanvasRenderingContext2D,
  startNode: Node,
  endPoint: { x: number; y: number },
  viewport: Viewport
): void {
  ctx.strokeStyle = '#ff6b35';
  ctx.lineWidth = 3 / viewport.scale;
  ctx.setLineDash([5 / viewport.scale, 5 / viewport.scale]);
  ctx.beginPath();
  ctx.moveTo(startNode.x, startNode.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();
  ctx.setLineDash([]);
}