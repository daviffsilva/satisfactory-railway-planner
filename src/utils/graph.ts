import { Node, Segment, Issue } from '../types/railway';

/**
 * Build adjacency list from segments
 */
export function buildAdjacencyList(
  segments: Segment[]
): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  
  for (const seg of segments) {
    if (!adj.has(seg.aNodeId)) {
      adj.set(seg.aNodeId, new Set());
    }
    if (!adj.has(seg.bNodeId)) {
      adj.set(seg.bNodeId, new Set());
    }
    
    adj.get(seg.aNodeId)!.add(seg.bNodeId);
    adj.get(seg.bNodeId)!.add(seg.aNodeId);
  }
  
  return adj;
}

/**
 * Find all connected components using DFS
 */
export function findConnectedComponents(
  nodes: Node[],
  adj: Map<string, Set<string>>
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];
  
  const dfs = (nodeId: string, component: string[]) => {
    visited.add(nodeId);
    component.push(nodeId);
    
    for (const neighborId of adj.get(nodeId) || []) {
      if (!visited.has(neighborId)) {
        dfs(neighborId, component);
      }
    }
  };
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      dfs(node.id, component);
      components.push(component);
    }
  }
  
  return components;
}

/**
 * Detect disconnected railway networks
 * 
 * NOTE: Multiple independent networks are ALLOWED and SUPPORTED in Satisfactory.
 * Players may intentionally create separate railway networks for different purposes.
 * 
 * This function reports disconnected components as INFORMATIONAL only when there are 3+ networks,
 * which may suggest unintentional fragmentation.
 */
export function findOrphanedTracks(
  nodes: Node[],
  segments: Segment[]
): Issue[] {
  if (nodes.length === 0) return [];
  
  const adj = buildAdjacencyList(segments);
  const components = findConnectedComponents(nodes, adj);
  
  // Multiple independent networks are allowed - only inform if 3+ components
  if (components.length <= 2) return [];
  
  const issues: Issue[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // Report all disconnected components as informational
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    
    // Find all segments in this component
    const componentSegments: string[] = [];
    for (const seg of segments) {
      if (comp.includes(seg.aNodeId) || comp.includes(seg.bNodeId)) {
        componentSegments.push(seg.id);
      }
    }
    
    if (componentSegments.length > 0) {
      // Compute centroid for display
      const positions = comp.map(id => nodeMap.get(id)!);
      const centroid = {
        x: positions.reduce((sum, p) => sum + p.x, 0) / positions.length,
        y: positions.reduce((sum, p) => sum + p.y, 0) / positions.length,
      };
      
      issues.push({
        id: crypto.randomUUID(),
        severity: 'info',  // Changed from 'warning' - just informational
        type: 'disconnected_network',
        elementIds: componentSegments,
        message: `Independent network ${i + 1} with ${componentSegments.length} segment(s)`,
        position: centroid,
      });
    }
  }
  
  return issues;
}
