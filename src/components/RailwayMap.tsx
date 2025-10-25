import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, TrackSegment, Signal } from '../App';
import './RailwayMap.css';

interface RailwayMapProps {
  selectedTool: ToolType;
  tracks: TrackSegment[];
  signals: Signal[];
  onTracksChange: (tracks: TrackSegment[]) => void;
  onSignalsChange: (signals: Signal[]) => void;
}

const RailwayMap: React.FC<RailwayMapProps> = ({
  selectedTool,
  tracks,
  signals,
  onTracksChange,
  onSignalsChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  const snapToGrid = useCallback((x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    };
  }, []);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  }, []);

  const drawTracks = useCallback((ctx: CanvasRenderingContext2D) => {
    tracks.forEach(track => {
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(track.startX, track.startY);
      ctx.lineTo(track.endX, track.endY);
      ctx.stroke();
    });
  }, [tracks]);

  const drawSignals = useCallback((ctx: CanvasRenderingContext2D) => {
    signals.forEach(signal => {
      const size = 8;
      ctx.fillStyle = signal.type === 'block' ? '#4a9eff' : '#00ff88';
      ctx.fillRect(signal.x - size/2, signal.y - size/2, size, size);
      
      // Draw direction indicator
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const arrowSize = 6;
      switch (signal.direction) {
        case 'north':
          ctx.moveTo(signal.x, signal.y - size/2);
          ctx.lineTo(signal.x - arrowSize/2, signal.y - size/2 - arrowSize);
          ctx.moveTo(signal.x, signal.y - size/2);
          ctx.lineTo(signal.x + arrowSize/2, signal.y - size/2 - arrowSize);
          break;
        case 'south':
          ctx.moveTo(signal.x, signal.y + size/2);
          ctx.lineTo(signal.x - arrowSize/2, signal.y + size/2 + arrowSize);
          ctx.moveTo(signal.x, signal.y + size/2);
          ctx.lineTo(signal.x + arrowSize/2, signal.y + size/2 + arrowSize);
          break;
        case 'east':
          ctx.moveTo(signal.x + size/2, signal.y);
          ctx.lineTo(signal.x + size/2 + arrowSize, signal.y - arrowSize/2);
          ctx.moveTo(signal.x + size/2, signal.y);
          ctx.lineTo(signal.x + size/2 + arrowSize, signal.y + arrowSize/2);
          break;
        case 'west':
          ctx.moveTo(signal.x - size/2, signal.y);
          ctx.lineTo(signal.x - size/2 - arrowSize, signal.y - arrowSize/2);
          ctx.moveTo(signal.x - size/2, signal.y);
          ctx.lineTo(signal.x - size/2 - arrowSize, signal.y + arrowSize/2);
          break;
      }
      ctx.stroke();
    });
  }, [signals]);

  const drawPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!startPoint || !hoverPoint) return;

    if (selectedTool === 'track') {
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(hoverPoint.x, hoverPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [selectedTool, startPoint, hoverPoint]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    drawGrid(ctx);

    // Draw existing tracks
    drawTracks(ctx);

    // Draw existing signals
    drawSignals(ctx);

    // Draw preview
    drawPreview(ctx);
  }, [drawGrid, drawTracks, drawSignals, drawPreview]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const snapped = snapToGrid(pos.x, pos.y);

    if (selectedTool === 'track') {
      setIsDrawing(true);
      setStartPoint(snapped);
    } else if (selectedTool === 'block-signal' || selectedTool === 'path-signal') {
      const newSignal: Signal = {
        id: Date.now().toString(),
        x: snapped.x,
        y: snapped.y,
        type: selectedTool === 'block-signal' ? 'block' : 'path',
        direction: 'north'
      };
      onSignalsChange([...signals, newSignal]);
    } else if (selectedTool === 'delete') {
      // Delete tracks or signals at this position
      const threshold = 10;
      const filteredTracks = tracks.filter(track => {
        const distToStart = Math.sqrt((track.startX - snapped.x) ** 2 + (track.startY - snapped.y) ** 2);
        const distToEnd = Math.sqrt((track.endX - snapped.x) ** 2 + (track.endY - snapped.y) ** 2);
        return distToStart > threshold && distToEnd > threshold;
      });
      
      const filteredSignals = signals.filter(signal => {
        const dist = Math.sqrt((signal.x - snapped.x) ** 2 + (signal.y - snapped.y) ** 2);
        return dist > threshold;
      });
      
      onTracksChange(filteredTracks);
      onSignalsChange(filteredSignals);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const snapped = snapToGrid(pos.x, pos.y);
    setHoverPoint(snapped);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'track' && isDrawing && startPoint) {
      const pos = getMousePos(e);
      const snapped = snapToGrid(pos.x, pos.y);
      
      if (snapped.x !== startPoint.x || snapped.y !== startPoint.y) {
        const newTrack: TrackSegment = {
          id: Date.now().toString(),
          startX: startPoint.x,
          startY: startPoint.y,
          endX: snapped.x,
          endY: snapped.y,
          type: 'straight'
        };
        onTracksChange([...tracks, newTrack]);
      }
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    setStartPoint(null);
    setHoverPoint(null);
  };

  return (
    <div className="railway-map">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="map-canvas"
      />
    </div>
  );
};

export default RailwayMap;

