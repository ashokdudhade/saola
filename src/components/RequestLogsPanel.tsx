import type { HeaderPair } from '../types';
import './RequestLogsPanel.css';

export interface RequestLogEntry {
  id: string;
  timestamp: number;
  requestName: string;
  method: string;
  url: string;
  headers: HeaderPair[];
  body: string | null;
  status?: number;
  statusText?: string;
  responseHeaders?: HeaderPair[];
  responseBody?: string;
  durationMs?: number;
  error?: string;
}

interface RequestLogsPanelProps {
  logs: RequestLogEntry[];
  open: boolean;
  onClose: () => void;
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'status-2xx';
  if (status >= 300 && status < 400) return 'status-3xx';
  if (status >= 400 && status < 500) return 'status-4xx';
  if (status >= 500) return 'status-5xx';
  return '';
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function LogEntry({ log }: { log: RequestLogEntry }) {
  return (
    <div className="request-log-entry">
      <div className="request-log-summary">
        <span className={`method-badge method-${(log.method || 'get').toLowerCase()}`}>
          {log.method}
        </span>
        <span className={`status-badge ${log.status != null ? getStatusClass(log.status) : ''}`}>
          {log.status ?? '—'}
        </span>
        <span className="log-url" title={log.url}>
          {log.url.length > 60 ? log.url.slice(0, 60) + '…' : log.url}
        </span>
        {log.durationMs != null && (
          <span className="log-duration">{log.durationMs}ms</span>
        )}
        <span className="log-time">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="request-log-details">
        <details>
          <summary>Request</summary>
          <div className="log-section">
            <pre>{log.method} {log.url}</pre>
            {log.headers.length > 0 && (
              <>
                <strong>Headers</strong>
                <pre>
                  {log.headers.filter((h) => h.enabled).map((h) => `${h.key}: ${h.value}`).join('\n')}
                </pre>
              </>
            )}
            {log.body && (
              <>
                <strong>Body</strong>
                <pre><code>{log.body}</code></pre>
                <button type="button" className="log-copy" onClick={() => copyToClipboard(log.body ?? '')}>
                  Copy
                </button>
              </>
            )}
          </div>
        </details>
        <details>
          <summary>Response</summary>
          <div className="log-section">
            {log.error ? (
              <pre className="log-error">{log.error}</pre>
            ) : (
              <>
                {log.status != null && <pre>{log.status} {log.statusText ?? ''}</pre>}
                {log.responseHeaders && log.responseHeaders.length > 0 && (
                  <>
                    <strong>Headers</strong>
                    <pre>{log.responseHeaders.map((h) => `${h.key}: ${h.value}`).join('\n')}</pre>
                  </>
                )}
                {log.responseBody != null && (
                  <>
                    <strong>Body</strong>
                    <pre>
                      <code>
                        {log.responseBody.length > 2000
                          ? log.responseBody.slice(0, 2000) + '\n… (truncated, ' + log.responseBody.length + ' chars)'
                          : log.responseBody}
                      </code>
                    </pre>
                    <button type="button" className="log-copy" onClick={() => copyToClipboard(log.responseBody ?? '')}>
                      Copy
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

export function RequestLogsPanel({ logs, open, onClose }: RequestLogsPanelProps) {
  if (!open) return null;
  return (
    <div className="request-logs-panel">
      <div className="request-logs-header">
        <h3>Request Logs</h3>
        <button type="button" onClick={onClose} aria-label="Close logs">×</button>
      </div>
      <div className="request-logs-list">
        {logs.length === 0 ? (
          <div className="request-logs-empty">Send requests to see logs</div>
        ) : (
          [...logs].reverse().map((log) => <LogEntry key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}
