import { describe, it, expect } from 'vitest';
import { findOrphanedTracks, buildAdjacencyList } from '../graph';
import { Node, Segment } from '../../types/railway';

describe('graph utilities', () => {
  describe('buildAdjacencyList', () => {
    it('builds correct adjacency list', () => {
      const segments: Segment[] = [
        { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
        { id: 's2', aNodeId: 'n2', bNodeId: 'n3', geometry: 'straight' },
      ];

      const adj = buildAdjacencyList(segments);

      expect(adj.get('n1')?.has('n2')).toBe(true);
      expect(adj.get('n2')?.has('n1')).toBe(true);
      expect(adj.get('n2')?.has('n3')).toBe(true);
      expect(adj.get('n3')?.has('n2')).toBe(true);
    });
  });

  describe('findOrphanedTracks', () => {
    it('does not report 2 disconnected networks', () => {
      const nodes: Node[] = [
        { id: 'n1', x: 0, y: 0, type: 'regular' },
        { id: 'n2', x: 1000, y: 0, type: 'regular' },
        { id: 'n3', x: 5000, y: 0, type: 'regular' },
        { id: 'n4', x: 6000, y: 0, type: 'regular' },
      ];

      const segments: Segment[] = [
        { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
        { id: 's2', aNodeId: 'n3', bNodeId: 'n4', geometry: 'straight' },
      ];

      const issues = findOrphanedTracks(nodes, segments);

      expect(issues.length).toBe(0);
    });

    it('reports 3+ disconnected networks as info', () => {
      const nodes: Node[] = [
        { id: 'n1', x: 0, y: 0, type: 'regular' },
        { id: 'n2', x: 1000, y: 0, type: 'regular' },
        { id: 'n3', x: 5000, y: 0, type: 'regular' },
        { id: 'n4', x: 6000, y: 0, type: 'regular' },
        { id: 'n5', x: 10000, y: 0, type: 'regular' },
        { id: 'n6', x: 11000, y: 0, type: 'regular' },
      ];

      const segments: Segment[] = [
        { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
        { id: 's2', aNodeId: 'n3', bNodeId: 'n4', geometry: 'straight' },
        { id: 's3', aNodeId: 'n5', bNodeId: 'n6', geometry: 'straight' },
      ];

      const issues = findOrphanedTracks(nodes, segments);

      expect(issues.length).toBe(3);
      expect(issues[0].severity).toBe('info');
      expect(issues[0].type).toBe('disconnected_network');
    });

    it('returns no issues for connected network', () => {
      const nodes: Node[] = [
        { id: 'n1', x: 0, y: 0, type: 'regular' },
        { id: 'n2', x: 1000, y: 0, type: 'regular' },
        { id: 'n3', x: 2000, y: 0, type: 'regular' },
      ];

      const segments: Segment[] = [
        { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
        { id: 's2', aNodeId: 'n2', bNodeId: 'n3', geometry: 'straight' },
      ];

      const issues = findOrphanedTracks(nodes, segments);

      expect(issues.length).toBe(0);
    });
  });
});
