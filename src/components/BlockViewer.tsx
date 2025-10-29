import React from 'react';
import { Block } from '../types/railway';
import './BlockViewer.css';

interface BlockViewerProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string) => void;
}

const BlockViewer: React.FC<BlockViewerProps> = ({
  blocks,
  selectedBlockId,
  onBlockSelect,
}) => {
  return (
    <div className="block-viewer">
      <h3>Blocks ({blocks.length})</h3>
      
      <div className="block-list">
        {blocks.map(block => (
          <div
            key={block.id}
            className={`block-item ${
              selectedBlockId === block.id ? 'selected' : ''
            }`}
            onClick={() => onBlockSelect(block.id)}
            role="button"
            tabIndex={0}
          >
            <div
              className="block-color"
              style={{ backgroundColor: block.color }}
            />
            <div className="block-info">
              <div className="block-name">Block {block.id.slice(0, 8)}</div>
              <div className="block-stats">
                {block.segmentIds.length} segments
                {block.boundarySignalIds.length > 0 && (
                  <>, {block.boundarySignalIds.length} signals</>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {blocks.length === 0 && (
        <div className="no-blocks">
          <p>No blocks yet. Add signals to create blocks.</p>
        </div>
      )}
    </div>
  );
};

export default BlockViewer;
