import React, { useState } from 'react';
import RailwayMap from './components/RailwayMap';
import ToolPanel from './components/ToolPanel';
import './App.css';

export type ToolType = 'select' | 'track' | 'block-signal' | 'path-signal' | 'delete';

export interface TrackSegment {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'straight' | 'curve';
}

export interface Signal {
  id: string;
  x: number;
  y: number;
  type: 'block' | 'path';
  direction: 'north' | 'south' | 'east' | 'west';
}

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [tracks, setTracks] = useState<TrackSegment[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);

  return (
    <div className="app">
      <ToolPanel 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onClearAll={() => {
          setTracks([]);
          setSignals([]);
        }}
        onSave={() => {
          const data = { tracks, signals };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'railway-design.json';
          a.click();
          URL.revokeObjectURL(url);
        }}
        onLoad={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target?.result as string);
                setTracks(data.tracks || []);
                setSignals(data.signals || []);
              } catch (error) {
                alert('Error loading file');
              }
            };
            reader.readAsText(file);
          }
        }}
      />
      <RailwayMap
        selectedTool={selectedTool}
        tracks={tracks}
        signals={signals}
        onTracksChange={setTracks}
        onSignalsChange={setSignals}
      />
    </div>
  );
}

export default App;

