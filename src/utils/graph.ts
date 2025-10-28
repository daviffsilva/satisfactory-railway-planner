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
    
    for (const neighborId of Array.from(adj.get(nodeId) || [])) {
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
 * Find orphaned tracks (disconnected from main network)
 */
export function findOrphanedTracks(
  nodes: Node[],
  segments: Segment[]
): Issue[] {
  if (nodes.length === 0) return [];
  
  const adj = buildAdjacencyList(segments);
  const components = findConnectedComponents(nodes, adj);
  
  // If only one component, no orphans
  if (components.length <= 1) return [];
  
  // Find largest component (main graph)
  let largestComponent = components[0];
  for (const comp of components) {
    if (comp.length > largestComponent.length) {
      largestComponent = comp;
    }
  }
  
  const issues: Issue[] = [];
  const largestSet = new Set(largestComponent);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  for (const comp of components) {
    if (comp === largestComponent) continue;
    
    // Find all segments in this orphaned component
    const orphanedSegments: string[] = [];
    for (const seg of segments) {
      if (comp.includes(seg.aNodeId) || comp.includes(seg.bNodeId)) {
        orphanedSegments.push(seg.id);
      }
    }
    
    if (orphanedSegments.length > 0) {
      // Compute centroid for display
      const positions = comp.map(id => nodeMap.get(id)!);
      const centroid = {
        x: positions.reduce((sum, p) => sum + p.x, 0) / positions.length,
        y: positions.reduce((sum, p) => sum + p.y, 0) / positions.length,
      };
      
      issues.push({
        id: crypto.randomUUID(),
        severity: 'warning',
        type: 'orphaned_track',
        elementIds: orphanedSegments,
        message: `${orphanedSegments.length} segment(s) disconnected from main network`,
        position: centroid,
      });
    }
  }
  
  return issues;
}