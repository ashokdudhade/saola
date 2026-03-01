import { useState, useEffect } from 'react';
import type { Collection, CollectionItem } from '../types';
import './SaveToCollectionModal.css';

interface SaveTarget {
  id: string;
  name: string;
  type: 'collection' | 'folder';
}

interface SaveToCollectionModalProps {
  open: boolean;
  collections: Collection[];
  defaultName: string;
  onSave: (parentId: string, name: string) => void;
  onSaveAs?: (parentId: string, name: string) => void;
  saveAsMode?: boolean;
  onClose: () => void;
}

function collectTargets(collections: Collection[]): SaveTarget[] {
  const targets: SaveTarget[] = [];
  function walk(items: CollectionItem[]) {
    for (const item of items) {
      if (item.type === 'folder') {
        targets.push({ id: item.id, name: item.name, type: 'folder' });
        walk(item.children);
      }
    }
  }
  for (const col of collections) {
    targets.push({ id: col.id, name: col.name, type: 'collection' });
    walk(col.children);
  }
  return targets;
}

export function SaveToCollectionModal({
  open,
  collections,
  defaultName,
  onSave,
  onSaveAs,
  saveAsMode = false,
  onClose,
}: SaveToCollectionModalProps) {
  const [name, setName] = useState(defaultName);
  const [parentId, setParentId] = useState(collections[0]?.id ?? '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const targets = collectTargets(collections);
  const canSave = targets.length > 0 && parentId && name.trim();
  const handleSaveClick = saveAsMode && onSaveAs ? onSaveAs : onSave;

  const handleSave = () => {
    if (!canSave) return;
    handleSaveClick(parentId, name.trim());
    onClose();
  };

  return (
    <div className="save-modal-overlay" onClick={onClose}>
      <div className="save-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{saveAsMode ? 'Save as' : 'Save to Collection'}</h3>
        {targets.length === 0 ? (
          <p className="save-modal-empty">Create a collection first from the sidebar.</p>
        ) : (
          <>
            <label>Request name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Request"
            />
            <label>Location</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.type === 'collection' ? 'Collection: ' : '  Folder: '}
                  {t.name}
                </option>
              ))}
            </select>
          </>
        )}
        <div className="save-modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}>
            {saveAsMode ? 'Save as' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
