import { describe, it, expect } from 'vitest';
import { segmentsIntersect, findSelfIntersections } from '../geometry';
import { Segment, Node } from '../../types/railway';

describe('geometry utilities', () => {
  describe('segmentsIntersect', () => {
    it('detects intersection of crossing segments', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 1000, y: 1000 };
      const b1 = { x: 0, y: 1000 };
      const b2 = { x: 1000, y: 0 };

      expect(segmentsIntersect(a1, a2, b1, b2)).toBe(true);
    });

    it('does not detect parallel segments as intersecting', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 1000, y: 0 };
      const b1 = { x: 0, y: 500 };
      const b2 = { x: 1000, y: 500 };

      expect(segmentsIntersect(a1, a2, b1, b2)).toBe(false);
    });

    it('excludes endpoint intersections', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 1000, y: 0 };
      const b1 = { x: 1000, y: 0 };
      const b2 = { x: 1000, y: 1000 };

      expect(segmentsIntersect(a1, a2, b1, b2)).toBe(false);
    });
  });

  describe('findSelfIntersections', () => {
    it('finds intersecting segments', () => {
      const nodes: Node[] = [
        { id: 'n1', x: 0, y: 0, type: 'regular' },
        { id: 'n2', x: 1000, y: 1000, type: 'regular' },
        { id: 'n3', x: 0, y: 1000, type: 'regular' },
        { id: 'n4', x: 1000, y: 0, type: 'regular' },
      ];

      const segments: Segment[] = [
        { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
        { id: 's2', aNodeId: 'n3', bNodeId: 'n4', geometry: 'straight' },
      ];

      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      const issues = findSelfIntersections(segments, nodeMap);

      expect(issues.length).toBe(1);
      expect(issues[0].type).toBe('self_intersection');
    });

    it('allows segments sharing a node', () => {
      const nodes: Node[] = [
        { id: 'n1', x: 0, y: 0, type: 'regular' },
        { id: 'n2', x: 1000, y: 0, type: 'regular' },
        { id: 'n3', x: 1000, y: 1000, type: 'regular' },
      ];

      const segments: Segment[] = [
        { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
        { id: 's2', aNodeId: 'n2', bNodeId: 'n3', geometry: 'straight' },
      ];

      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      const issues = findSelfIntersections(segments, nodeMap);

      expect(issues.length).toBe(0);
    });
  });
});
