import { describe, it, expect } from 'vitest';
import { evaluateBezier, computeBezierLength } from '../curves';

describe('bezier curves', () => {
  it('evaluates curve at t=0 to start point', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 500, y: 500 };
    const p2 = { x: 1000, y: 0 };
    
    const result = evaluateBezier(p0, p1, p2, 0);
    
    expect(result.x).toBeCloseTo(p0.x);
    expect(result.y).toBeCloseTo(p0.y);
  });
  
  it('evaluates curve at t=1 to end point', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 500, y: 500 };
    const p2 = { x: 1000, y: 0 };
    
    const result = evaluateBezier(p0, p1, p2, 1);
    
    expect(result.x).toBeCloseTo(p2.x);
    expect(result.y).toBeCloseTo(p2.y);
  });
  
  it('computes curve length', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 0, y: 500 };
    const p2 = { x: 1000, y: 0 };
    
    const length = computeBezierLength(p0, p1, p2);
    
    // Should be longer than straight line (1000)
    expect(length).toBeGreaterThan(1000);
    // But not too much longer
    expect(length).toBeLessThan(1500);
  });
});
