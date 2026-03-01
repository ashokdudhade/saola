import type { RequestTab } from '../types';
import './RequestTabs.css';

interface RequestTabsProps {
  tabs: RequestTab[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew?: () => void;
}

export function RequestTabs({ tabs, activeId, onSelect, onClose, onNew }: RequestTabsProps) {
  return (
    <div className="request-tabs-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`request-tab ${activeId === tab.id ? 'active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          <span className={`request-tab-method method-${(tab.method || 'get').toLowerCase()}`}>{tab.method}</span>
          <span className="request-tab-name">{tab.name || 'Untitled'}</span>
          <button
            type="button"
            className="request-tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            aria-label="Close tab"
          >
            ×
          </button>
        </div>
      ))}
      {onNew && (
        <button type="button" className="tab-new" onClick={onNew} title="New request" aria-label="New request">
          +
        </button>
      )}
    </div>
  );
}
