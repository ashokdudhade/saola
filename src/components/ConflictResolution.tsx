import './ConflictResolution.css';

interface ConflictResolutionProps {
  onResolve: (choice: 'local' | 'remote' | 'merge') => void;
}

export function ConflictResolution({ onResolve }: ConflictResolutionProps) {
  return (
    <div className="conflict-resolution">
      <h4>Conflict detected</h4>
      <p>Choose how to resolve:</p>
      <div className="conflict-actions">
        <button type="button" onClick={() => onResolve('local')}>
          Keep local
        </button>
        <button type="button" onClick={() => onResolve('remote')}>
          Use remote
        </button>
        <button type="button" onClick={() => onResolve('merge')}>
          Merge (visual diff)
        </button>
      </div>
    </div>
  );
}
