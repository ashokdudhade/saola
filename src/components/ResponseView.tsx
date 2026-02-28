import type { HttpResponse } from '../types';
import './ResponseView.css';

interface ResponseViewProps {
  response: HttpResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'status-2xx';
  if (status >= 300 && status < 400) return 'status-3xx';
  if (status >= 400 && status < 500) return 'status-4xx';
  if (status >= 500) return 'status-5xx';
  return '';
}

export function ResponseView({ response, isLoading, error }: ResponseViewProps) {
  if (isLoading) {
    return (
      <div className="response-view">
        <div className="response-loading">Loading response...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="response-view">
        <div className="response-error">{error}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-view">
        <div className="response-placeholder">Send a request to see the response</div>
      </div>
    );
  }

  const statusClass = getStatusClass(response.status);

  return (
    <div className="response-view">
      <div className="response-meta">
        <span className={`status-badge ${statusClass}`}>
          {response.status} {response.statusText}
        </span>
      </div>
      {response.headers.length > 0 && (
        <div className="response-headers">
          <details>
            <summary>Headers</summary>
            <pre>
              {response.headers
                .filter((h) => h.enabled)
                .map((h) => `${h.key}: ${h.value}`)
                .join('\n')}
            </pre>
          </details>
        </div>
      )}
      <pre className="response-body">{response.body || '(empty body)'}</pre>
    </div>
  );
}
