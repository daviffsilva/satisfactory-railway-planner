import { describe, it, expect } from 'vitest';
import { computeBlocks } from '../blocks';
import { Node, Segment, Signal } from '../../types/railway';

describe('block computation', () => {
  it('creates single block with no signals', () => {
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, type: 'regular' },
      { id: 'n2', x: 1000, y: 0, type: 'regular' },
      { id: 'n3', x: 2000, y: 0, type: 'regular' },
    ];
    
    const segments: Segment[] = [
      { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
      { id: 's2', aNodeId: 'n2', bNodeId: 'n3', geometry: 'straight' },
    ];
    
    const signals: Signal[] = [];
    
    const blocks = computeBlocks(segments, signals, nodes);
    
    expect(blocks.length).toBe(1);
    expect(blocks[0].segmentIds.length).toBe(2);
  });
  
  it('splits blocks at signals', () => {
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, type: 'regular' },
      { id: 'n2', x: 1000, y: 0, type: 'regular' },
      { id: 'n3', x: 2000, y: 0, type: 'regular' },
    ];
    
    const segments: Segment[] = [
      { id: 's1', aNodeId: 'n1', bNodeId: 'n2', geometry: 'straight' },
      { id: 's2', aNodeId: 'n2', bNodeId: 'n3', geometry: 'straight' },
    ];
    
    const signals: Signal[] = [
      {
        id: 'sig1',
        segmentId: 's1',
        offsetT: 0.5,
        orientation: 'AtoB',
        type: 'block',
      },
    ];
    
    const blocks = computeBlocks(segments, signals, nodes);
    
    expect(blocks.length).toBeGreaterThan(1);
  });
});
