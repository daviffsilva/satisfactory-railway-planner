import React from 'react';
import { Block } from '../types/railway';
import { Action } from '../state/actions';
import './BlockViewer.css';

interface BlockViewerProps {
  blocks: Block[];
  selectedBlockId: string | null;
  showBlocks: boolean;
  dispatch: React.Dispatch<Action>;
}

const BlockViewer: React.FC<BlockViewerProps> = ({
  blocks,
  selectedBlockId,
  showBlocks,
  dispatch,
}) => {
  const handleBlockSelect = (blockId: string) => {
    dispatch({
      type: 'BLOCK_SELECT',
      payload: { blockId: selectedBlockId === blockId ? null : blockId },
    });
  };

  const handleToggleBlocks = () => {
    dispatch({ type: 'BLOCKS_TOGGLE', payload: { show: !showBlocks } });
  };

  return (
    <div className="block-viewer">
      <div className="block-viewer-header">
        <h3>Blocks ({blocks.length})</h3>
        <label className="block-toggle">
          <input
            type="checkbox"
            checked={showBlocks}
            onChange={handleToggleBlocks}
          />
          Show Blocks
        </label>
      </div>
      
      <div className="block-list">
        {blocks.map(block => (
          <div
            key={block.id}
            className={`block-item ${
              selectedBlockId === block.id ? 'selected' : ''
            }`}
            onClick={() => handleBlockSelect(block.id)}
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
              {block.metadata?.isOrphan && (
                <div className="block-warning">⚠️ Orphaned</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {blocks.length === 0 && (
        <div className="no-blocks">
          No blocks computed. Add signals to create blocks.
        </div>
      )}
    </div>
  );
};

export default BlockViewer;