import { useState, useEffect, useCallback } from 'react';
import './GlobalSearch.css';

interface SearchResult {
  id: string;
  name: string;
  type: 'request' | 'collection' | 'variable';
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onSelectRequest?: (url: string) => void;
}

export function GlobalSearch({ open, onClose, onSelectRequest }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    // Placeholder: search collections, requests, variables
    const q = query.toLowerCase();
    const mock: SearchResult[] = [
      { id: '1', name: 'Get Users', type: 'request', path: 'My Collection / API' },
      { id: '2', name: 'Example Request', type: 'request', path: 'My Collection' },
    ];
    setResults(mock.filter((r) => r.name.toLowerCase().includes(q)));
  }, [query]);

  useEffect(() => {
    const id = setTimeout(search, 150);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          placeholder="Search requests and variables (Ctrl+P)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="global-search-results">
          {results.map((r) => (
            <div
              key={r.id}
              className="search-result"
              onClick={() => {
                onSelectRequest?.(r.name);
                onClose();
              }}
            >
              <span className="result-name">{r.name}</span>
              <span className="result-path">{r.path}</span>
            </div>
          ))}
          {query && results.length === 0 && <div className="no-results">No results</div>}
        </div>
      </div>
    </div>
  );
}
