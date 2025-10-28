import React from 'react';
import { Issue } from '../types/railway';
import { Action } from '../state/actions';
import './IssuesPanel.css';

interface IssuesPanelProps {
  issues: Issue[];
  dispatch: React.Dispatch<Action>;
}

const IssuesPanel: React.FC<IssuesPanelProps> = ({ issues, dispatch }) => {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const info = issues.filter(i => i.severity === 'info');

  const handleIssueClick = (issue: Issue) => {
    if (issue.position) {
      // Focus camera on issue (center viewport on issue position)
      // This requires calculating the necessary viewport offset
      // For now, we'll just select the affected elements
      dispatch({
        type: 'SELECTION_SET',
        payload: { ids: issue.elementIds },
      });
    }
  };

  return (
    <div className="issues-panel">
      <h3>Issues ({errors.length + warnings.length})</h3>

      {errors.length > 0 && (
        <div className="issue-group errors">
          <h4>❌ Errors ({errors.length})</h4>
          {errors.map(issue => (
            <div
              key={issue.id}
              className="issue-item error"
              onClick={() => handleIssueClick(issue)}
              role="button"
              tabIndex={0}
            >
              <span className="issue-message">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="issue-group warnings">
          <h4>⚠️ Warnings ({warnings.length})</h4>
          {warnings.map(issue => (
            <div
              key={issue.id}
              className="issue-item warning"
              onClick={() => handleIssueClick(issue)}
              role="button"
              tabIndex={0}
            >
              <span className="issue-message">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {info.length > 0 && (
        <div className="issue-group info">
          <h4>ℹ️ Information ({info.length})</h4>
          {info.map(issue => (
            <div
              key={issue.id}
              className="issue-item info"
              onClick={() => handleIssueClick(issue)}
              role="button"
              tabIndex={0}
            >
              <span className="issue-message">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {issues.length === 0 && (
        <div className="no-issues">✅ No issues detected</div>
      )}
    </div>
  );
};

export default IssuesPanel;
