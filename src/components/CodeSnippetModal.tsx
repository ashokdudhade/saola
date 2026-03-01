import { useState, useEffect } from 'react';
import { generateSnippet, SNIPPET_LANGUAGES, type SnippetLang, type RequestInput } from '../utils/codeSnippet';
import './CodeSnippetModal.css';

interface CodeSnippetModalProps {
  open: boolean;
  request: RequestInput | null;
  onClose: () => void;
}

export function CodeSnippetModal({ open, request, onClose }: CodeSnippetModalProps) {
  const [lang, setLang] = useState<SnippetLang>('curl');
  const [copied, setCopied] = useState(false);
  const snippet = request ? generateSnippet(request, lang) : '';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!open) return null;

  return (
    <div className="code-snippet-overlay" onClick={onClose}>
      <div className="code-snippet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-snippet-header">
          <h3>Generate Code Snippet</h3>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="code-snippet-langs">
          {SNIPPET_LANGUAGES.map((l) => (
            <button key={l.id} type="button" className={lang === l.id ? 'active' : ''} onClick={() => setLang(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <pre className="code-snippet-output">{snippet || 'Configure a request first.'}</pre>
        <div className="code-snippet-actions">
          <button type="button" onClick={handleCopy} disabled={!snippet} aria-label="Copy to clipboard">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
