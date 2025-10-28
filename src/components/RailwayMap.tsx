import React, { useRef, useEffect, useCallback } from 'react';
import { AppState } from '../types/state';
import { Node, Segment } from '../types/railway';
import { Action } from '../state/actions';
import {
  screenToWorld,
  snapToGrid,
  findNearestNode,
} from '../utils/coordinates';
import {
  renderGrid,
  renderSegments,
  renderNodes,
  renderIssues,
  renderDrawPreview,
  renderSignals,
  renderBlocks,
} from '../utils/rendering';
import { findSegmentAtPoint, findNearestPointOnSegment } from '../utils/signalPlacement';
import './RailwayMap.css';

interface RailwayMapProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const RailwayMap: React.FC<RailwayMapProps> = ({ state, dispatch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Render frame
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.currentProject) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transform
    ctx.save();
    ctx.setTransform(
      state.viewport.scale,
      0,
      0,
      state.viewport.scale,
      state.viewport.offsetX,
      state.viewport.offsetY
    );

    // Build node map for efficient lookups
    const nodeMap = new Map(state.currentProject.nodes.map(n => [n.id, n]));
    const segmentMap = new Map(state.currentProject.segments.map(s => [s.id, s]));

    // Render layers
    if (state.currentProject.settings.grid.visible) {
      renderGrid(
        ctx,
        state.viewport,
        state.currentProject.settings.grid.size,
        state.currentProject.settings.grid.opacity
      );
    }

    // Render blocks first (background)
    if (state.showBlocks && state.blocks.length > 0) {
      renderBlocks(
        ctx,
        state.blocks,
        state.currentProject.segments,
        nodeMap,
        state.selectedBlockId,
        state.viewport
      );
    }

    if (state.currentProject.settings.display.showSegments) {
      renderSegments(
        ctx,
        state.currentProject.segments,
        nodeMap,
        state.selectedElementIds,
        state.hoverElementId,
        state.viewport
      );
    }

    if (state.currentProject.settings.display.showNodes) {
      renderNodes(
        ctx,
        state.currentProject.nodes,
        state.selectedElementIds,
        state.hoverElementId,
        state.viewport
      );
    }

    // Render signals
    if (state.currentProject.settings.display.showSignals) {
      renderSignals(
        ctx,
        state.currentProject.signals,
        segmentMap,
        nodeMap,
        state.selectedElementIds,
        state.hoverElementId,
        state.viewport
      );
    }

    if (state.currentProject.settings.display.showIssues) {
      renderIssues(ctx, state.issues, state.viewport);
    }

    // Draw preview
    if (state.drawStartNodeId && state.hoverPoint) {
      const startNode = nodeMap.get(state.drawStartNodeId);
      if (startNode) {
        renderDrawPreview(ctx, startNode, state.hoverPoint, state.viewport);
      }
    }

    ctx.restore();
  }, [state]);

  // Trigger re-render on state changes
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Mouse down handler
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !state.currentProject) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Pan mode (middle mouse or spacebar)
      if (e.button === 1 || state.selectedTool === 'pan') {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        return;
      }

      // Left mouse button
      if (e.button === 0) {
        let worldPoint = screenToWorld(screenX, screenY, state.viewport);
        let existingNodeId: string | null = null;

        // Apply snapping
        const settings = state.currentProject.settings;
        if (settings.grid.snapEnabled) {
          const nearNode = findNearestNode(
            worldPoint,
            state.currentProject.nodes,
            400 // 4 meters snap distance
          );
          if (nearNode) {
            worldPoint = { x: nearNode.x, y: nearNode.y };
            existingNodeId = nearNode.id;
          } else {
            worldPoint = snapToGrid(worldPoint, settings.grid.size);
          }
        }

        // Handle tool actions
        if (state.selectedTool === 'track') {
          if (!state.drawStartNodeId) {
            // Start drawing
            const nodeId =
              existingNodeId ||
              createNode(worldPoint, state.currentProject.nodes, dispatch);
            dispatch({ type: 'DRAW_START', payload: { nodeId } });
          } else {
            // End drawing
            const endNodeId =
              existingNodeId ||
              createNode(worldPoint, state.currentProject.nodes, dispatch);

            if (endNodeId !== state.drawStartNodeId) {
              // Create segment
              const segment: Segment = {
                id: crypto.randomUUID(),
                aNodeId: state.drawStartNodeId,
                bNodeId: endNodeId,
                geometry: 'straight',
                metadata: { createdAt: Date.now() },
              };
              dispatch({ type: 'SEGMENT_CREATE', payload: { segment } });
            }

            dispatch({ type: 'DRAW_END' });
          }
        } else if (state.selectedTool === 'signal') {
          // Signal placement
          const nodeMap = new Map(state.currentProject.nodes.map(n => [n.id, n]));
          const segment = findSegmentAtPoint(
            worldPoint,
            state.currentProject.segments,
            nodeMap,
            400 // 4 meters threshold
          );
          
          if (segment) {
            const offsetT = findNearestPointOnSegment(worldPoint, segment, nodeMap);
            const signal = {
              id: crypto.randomUUID(),
              segmentId: segment.id,
              offsetT,
              orientation: 'bidirectional' as const,
              type: 'block' as const,
              metadata: { createdAt: Date.now() },
            };
            dispatch({ type: 'SIGNAL_CREATE', payload: { signal } });
          }
        } else if (state.selectedTool === 'delete') {
          handleDelete(worldPoint, state, dispatch);
        }
      }
    },
    [state, dispatch]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !state.currentProject) return;

      // Handle panning
      if (isPanningRef.current) {
        const deltaX = e.clientX - panStartRef.current.x;
        const deltaY = e.clientY - panStartRef.current.y;
        dispatch({ type: 'VIEWPORT_PAN', payload: { deltaX, deltaY } });
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Update hover point
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      let worldPoint = screenToWorld(screenX, screenY, state.viewport);

      // Apply snapping for preview
      const settings = state.currentProject.settings;
      if (settings.grid.snapEnabled) {
        const nearNode = findNearestNode(
          worldPoint,
          state.currentProject.nodes,
          400
        );
        if (nearNode) {
          worldPoint = { x: nearNode.x, y: nearNode.y };
        } else {
          worldPoint = snapToGrid(worldPoint, settings.grid.size);
        }
      }

      dispatch({
        type: 'HOVER_UPDATE',
        payload: { point: worldPoint, elementId: null },
      });
    },
    [state, dispatch]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    isPanningRef.current = false;
    dispatch({
      type: 'HOVER_UPDATE',
      payload: { point: null, elementId: null },
    });
  }, [dispatch]);

  // Wheel handler (zoom)
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;

      dispatch({
        type: 'VIEWPORT_ZOOM',
        payload: { delta, centerX, centerY },
      });
    },
    [dispatch]
  );

  return (
    <div className="railway-map">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="map-canvas"
      />
    </div>
  );
};

// Helper function to create a node
function createNode(
  position: { x: number; y: number },
  existingNodes: Node[],
  dispatch: React.Dispatch<Action>
): string {
  const node: Node = {
    id: crypto.randomUUID(),
    x: position.x,
    y: position.y,
    type: 'regular',
    metadata: { createdAt: Date.now() },
  };
  dispatch({ type: 'NODE_CREATE', payload: { node } });
  return node.id;
}

// Helper function to handle delete
function handleDelete(
  worldPoint: { x: number; y: number },
  state: AppState,
  dispatch: React.Dispatch<Action>
): void {
  if (!state.currentProject) return;

  const threshold = 400; // 4 meters

  // Check for signal deletion first (signals are smaller and should take priority)
  const nodeMap = new Map(state.currentProject.nodes.map(n => [n.id, n]));
  const segmentMap = new Map(state.currentProject.segments.map(s => [s.id, s]));
  
  for (const signal of state.currentProject.signals) {
    const segment = segmentMap.get(signal.segmentId);
    if (!segment) continue;
    
    const nodeA = nodeMap.get(segment.aNodeId);
    const nodeB = nodeMap.get(segment.bNodeId);
    if (!nodeA || !nodeB) continue;
    
    // Calculate signal position
    const signalPos = {
      x: nodeA.x + (nodeB.x - nodeA.x) * signal.offsetT,
      y: nodeA.y + (nodeB.y - nodeA.y) * signal.offsetT,
    };
    
    const dist = Math.hypot(signalPos.x - worldPoint.x, signalPos.y - worldPoint.y);
    if (dist < threshold / 2) { // Smaller threshold for signals
      dispatch({ type: 'SIGNAL_DELETE', payload: { id: signal.id } });
      return;
    }
  }

  // Check for node deletion
  for (const node of state.currentProject.nodes) {
    const dist = Math.hypot(node.x - worldPoint.x, node.y - worldPoint.y);
    if (dist < threshold) {
      dispatch({ type: 'NODE_DELETE', payload: { id: node.id } });
      return;
    }
  }

  // Check for segment deletion
  for (const seg of state.currentProject.segments) {
    const nodeA = nodeMap.get(seg.aNodeId);
    const nodeB = nodeMap.get(seg.bNodeId);
    if (!nodeA || !nodeB) continue;

    // Point-to-line distance
    const dist = pointToLineDistance(worldPoint, nodeA, nodeB);
    if (dist < threshold) {
      dispatch({ type: 'SEGMENT_DELETE', payload: { id: seg.id } });
      return;
    }
  }
}

// Helper: point-to-line distance
function pointToLineDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export default RailwayMap;

