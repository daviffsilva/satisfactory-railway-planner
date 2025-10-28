import { Point, Node } from '../types/railway';
import { Viewport } from '../types/state';

/**
 * Coordinate System Utilities
 * 
 * Storage: Centimeters (Satisfactory native)
 * Display: Meters (user-friendly)
 * Screen: Canvas pixels
 */

// === UNIT CONVERSION ===

export function cmToMeters(cm: number): number {
  return cm / 100;
}

export function metersToCm(m: number): number {
  return m * 100;
}

export function formatCoordinate(cm: number, unit: 'cm' | 'm' | 'ft' = 'm'): string {
  switch (unit) {
    case 'cm':
      return `${cm.toFixed(0)} cm`;
    case 'm':
      return `${cmToMeters(cm).toFixed(2)} m`;
    case 'ft':
      return `${(cmToMeters(cm) * 3.28084).toFixed(2)} ft`;
  }
}

// === COORDINATE TRANSFORMATIONS ===

/**
 * Convert screen (canvas) coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport
): Point {
  return {
    x: (screenX - viewport.offsetX) / viewport.scale,
    y: (screenY - viewport.offsetY) / viewport.scale,
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport
): Point {
  return {
    x: worldX * viewport.scale + viewport.offsetX,
    y: worldY * viewport.scale + viewport.offsetY,
  };
}

// === SNAPPING ===

/**
 * Snap point to grid in world space
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Find nearest node within snap distance (world space)
 */
export function findNearestNode(
  point: Point,
  nodes: Node[],
  maxDistance: number
): Node | null {
  let nearest: Node | null = null;
  let minDist = maxDistance;
  
  for (const node of nodes) {
    const dist = Math.hypot(point.x - node.x, point.y - node.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }
  
  return nearest;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}