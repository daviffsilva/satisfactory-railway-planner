import { Block, Segment, Signal, Node, Issue } from '../types/railway';
import { buildAdjacencyList } from './graph';

/**
 * Compute blocks from segments and signals
 * 
 * Algorithm:
 * 1. Build graph with signals as additional split points
 * 2. DFS from each signal/junction to find block boundaries
 * 3. Assign unique colors to blocks
 * 4. Compute block metadata (length, connections)
 */
export function computeBlocks(
  segments: Segment[],
  signals: Signal[],
  nodes: Node[]
): Block[] {
  if (segments.length === 0) return [];
  
  // Step 1: Build signal map by segment
  const signalsBySegment = groupSignalsBySegment(signals);
  
  // Step 2: Split segments at signal boundaries
  const splitSegments = splitSegmentsAtSignals(segments, signalsBySegment);
  
  // Step 3: Build adjacency graph of split segments
  const adjacency = buildBlockAdjacency(splitSegments, nodes);
  
  // Step 4: Find connected components (blocks)
  const blocks = findBlocks(splitSegments, adjacency, signals);
  
  // Step 5: Assign colors
  assignBlockColors(blocks);
  
  return blocks;
}

/**
 * Group signals by their segment ID
 */
function groupSignalsBySegment(
  signals: Signal[]
): Map<string, Signal[]> {
  const map = new Map<string, Signal[]>();
  
  for (const signal of signals) {
    if (!map.has(signal.segmentId)) {
      map.set(signal.segmentId, []);
    }
    map.get(signal.segmentId)!.push(signal);
  }
  
  // Sort signals by offsetT within each segment
  for (const signalList of map.values()) {
    signalList.sort((a, b) => a.offsetT - b.offsetT);
  }
  
  return map;
}

/**
 * Split segments at signal positions
 * Returns virtual sub-segments for block computation
 */
interface SubSegment {
  id: string;
  parentSegmentId: string;
  startNodeId: string;
  endNodeId: string;
  startT: number;      // offsetT on parent segment
  endT: number;
  startSignalId?: string;
  endSignalId?: string;
}

function splitSegmentsAtSignals(
  segments: Segment[],
  signalsBySegment: Map<string, Signal[]>
): SubSegment[] {
  const subSegments: SubSegment[] = [];
  
  for (const segment of segments) {
    const segmentSignals = signalsBySegment.get(segment.id) || [];
    
    if (segmentSignals.length === 0) {
      // No signals: entire segment is one sub-segment
      subSegments.push({
        id: `${segment.id}:0-1`,
        parentSegmentId: segment.id,
        startNodeId: segment.aNodeId,
        endNodeId: segment.bNodeId,
        startT: 0,
        endT: 1,
      });
    } else {
      // Split at each signal
      let prevT = 0;
      let prevNodeId = segment.aNodeId;
      let prevSignalId: string | undefined = undefined;
      
      for (let i = 0; i < segmentSignals.length; i++) {
        const signal = segmentSignals[i];
        
        // Sub-segment from prev to this signal
        subSegments.push({
          id: `${segment.id}:${prevT}-${signal.offsetT}`,
          parentSegmentId: segment.id,
          startNodeId: prevNodeId,
          endNodeId: `signal:${signal.id}`, // Virtual node at signal
          startT: prevT,
          endT: signal.offsetT,
          startSignalId: prevSignalId,
          endSignalId: signal.id,
        });
        
        prevT = signal.offsetT;
        prevNodeId = `signal:${signal.id}`;
        prevSignalId = signal.id;
      }
      
      // Last sub-segment from last signal to end
      subSegments.push({
        id: `${segment.id}:${prevT}-1`,
        parentSegmentId: segment.id,
        startNodeId: prevNodeId,
        endNodeId: segment.bNodeId,
        startT: prevT,
        endT: 1,
        startSignalId: prevSignalId,
      });
    }
  }
  
  return subSegments;
}

/**
 * Build adjacency graph considering signal directionality
 */
function buildBlockAdjacency(
  subSegments: SubSegment[],
  nodes: Node[]
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  
  // Initialize all nodes
  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }
  
  // Add virtual signal nodes
  for (const sub of subSegments) {
    if (sub.startNodeId.startsWith('signal:')) {
      if (!adjacency.has(sub.startNodeId)) {
        adjacency.set(sub.startNodeId, new Set());
      }
    }
    if (sub.endNodeId.startsWith('signal:')) {
      if (!adjacency.has(sub.endNodeId)) {
        adjacency.set(sub.endNodeId, new Set());
      }
    }
  }
  
  // Add edges (bidirectional for now, directionality handled in block finding)
  for (const sub of subSegments) {
    adjacency.get(sub.startNodeId)!.add(sub.endNodeId);
    adjacency.get(sub.endNodeId)!.add(sub.startNodeId);
  }
  
  return adjacency;
}

/**
 * Find blocks using modified connected components algorithm
 */
function findBlocks(
  subSegments: SubSegment[],
  adjacency: Map<string, Set<string>>,
  signals: Signal[]
): Block[] {
  const blocks: Block[] = [];
  const visited = new Set<string>();
  const signalMap = new Map(signals.map(s => [s.id, s]));
  
  // Group sub-segments by blocks
  // A block is a maximal connected set of sub-segments
  // bounded by signals or junctions
  
  for (const sub of subSegments) {
    if (visited.has(sub.id)) continue;
    
    const blockSegments: SubSegment[] = [];
    const boundarySignals = new Set<string>();
    
    // BFS to find all sub-segments in this block
    const queue = [sub];
    visited.add(sub.id);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      blockSegments.push(current);
      
      if (current.startSignalId) {
        boundarySignals.add(current.startSignalId);
      }
      if (current.endSignalId) {
        boundarySignals.add(current.endSignalId);
      }
      
      // Find adjacent sub-segments
      for (const neighbor of subSegments) {
        if (visited.has(neighbor.id)) continue;
        
        // Check if this neighbor is adjacent and not separated by signal
        const connected = 
          (neighbor.startNodeId === current.endNodeId && !current.endSignalId) ||
          (neighbor.endNodeId === current.startNodeId && !current.startSignalId) ||
          (neighbor.startNodeId === current.startNodeId && !current.startSignalId) ||
          (neighbor.endNodeId === current.endNodeId && !current.endSignalId);
        
        if (connected) {
          visited.add(neighbor.id);
          queue.push(neighbor);
        }
      }
    }
    
    // Create block
    const block: Block = {
      id: crypto.randomUUID(),
      segmentIds: [...new Set(blockSegments.map(s => s.parentSegmentId))],
      boundarySignalIds: Array.from(boundarySignals),
      length: 0, // Computed later
      connectedBlockIds: [], // Computed later
      color: '#ffffff', // Assigned later
    };
    
    blocks.push(block);
  }
  
  return blocks;
}

/**
 * Assign unique, highly visible colors to blocks
 * Uses vibrant, high-contrast colors for better visibility on dark background
 */
function assignBlockColors(blocks: Block[]): void {
  // High-visibility color palette optimized for dark backgrounds
  // Each color has high saturation and brightness for maximum contrast
  const colors = [
    '#FF3366', // Hot Pink
    '#33FF57', // Bright Green
    '#3357FF', // Bright Blue
    '#FFD700', // Gold
    '#FF6B35', // Bright Orange
    '#00FFFF', // Cyan
    '#FF33FF', // Magenta
    '#7FFF00', // Chartreuse
    '#FF1493', // Deep Pink
    '#00FF7F', // Spring Green
    '#1E90FF', // Dodger Blue
    '#FFB900', // Amber
    '#FF4500', // Orange Red
    '#00CED1', // Dark Turquoise
    '#DA70D6', // Orchid
    '#ADFF2F', // Green Yellow
    '#FF69B4', // Hot Pink Light
    '#20B2AA', // Light Sea Green
    '#FF8C00', // Dark Orange
    '#9370DB', // Medium Purple
  ];
  
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].color = colors[i % colors.length];
  }
}

/**
 * Detect mega-blocks (blocks spanning multiple junctions)
 */
export function findMegaBlocks(
  blocks: Block[],
  segments: Segment[],
  nodes: Node[]
): Issue[] {
  const issues: Issue[] = [];
  
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const segmentMap = new Map(segments.map(s => [s.id, s]));
  
  for (const block of blocks) {
    const junctionCount = countJunctionsInBlock(block, segmentMap, nodeMap);
    
    if (junctionCount > 1) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'warning',
        type: 'mega_block',
        elementIds: block.segmentIds,
        message: `Block spans ${junctionCount} junctions - consider adding signals`,
      });
    }
  }
  
  return issues;
}

/**
 * Count junctions (degree >= 3 nodes) within a block
 */
function countJunctionsInBlock(
  block: Block,
  segmentMap: Map<string, Segment>,
  nodeMap: Map<string, Node>
): number {
  // Get all nodes in block
  const nodeIds = new Set<string>();
  for (const segId of block.segmentIds) {
    const seg = segmentMap.get(segId);
    if (seg) {
      nodeIds.add(seg.aNodeId);
      nodeIds.add(seg.bNodeId);
    }
  }
  
  // Count degree of each node within block
  const nodeDegrees = new Map<string, number>();
  for (const nodeId of nodeIds) {
    nodeDegrees.set(nodeId, 0);
  }
  
  for (const segId of block.segmentIds) {
    const seg = segmentMap.get(segId);
    if (seg) {
      nodeDegrees.set(seg.aNodeId, (nodeDegrees.get(seg.aNodeId) || 0) + 1);
      nodeDegrees.set(seg.bNodeId, (nodeDegrees.get(seg.bNodeId) || 0) + 1);
    }
  }
  
  // Count junctions (degree >= 3)
  let junctionCount = 0;
  for (const [nodeId, degree] of nodeDegrees) {
    if (degree >= 3) {
      junctionCount++;
    }
  }
  
  return junctionCount;
}
