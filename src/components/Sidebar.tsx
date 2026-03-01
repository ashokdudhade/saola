import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createCollection,
  createFolder,
  renameItem,
  deleteItem,
  saveRequest,
  isTauri,
} from '../api';
import type { Collection, CollectionItem } from '../types';
import './Sidebar.css';

const INDENT_PER_LEVEL = 16;

interface SidebarProps {
  collections: Collection[];
  loading?: boolean;
  onRefresh: () => void;
  onNewRequestInFolder?: (parentId: string) => void;
  onSelectRequest: (req: {
    id: string;
    name: string;
    method: string;
    url: string;
    params: { key: string; value: string; enabled: boolean }[];
    headers: { key: string; value: string; enabled: boolean }[];
    body: string | null;
    parentId: string;
  }) => void;
  collapsed: boolean;
}

interface ContextMenu {
  x: number;
  y: number;
  type: 'collection' | 'folder' | 'request';
  id: string;
  name: string;
  parentId?: string;
  requestData?: {
    method: string;
    url: string;
    params: { key: string; value: string; enabled: boolean }[];
    headers: { key: string; value: string; enabled: boolean }[];
    body: string | null;
  };
}

const defaultParams = [{ key: '', value: '', enabled: true }];
const defaultHeaders = [{ key: 'Content-Type', value: 'application/json', enabled: true }];

function CollectionNode({
  item,
  parentId,
  onSelectRequest,
  onContextMenu,
  depth,
  expandedIds,
  onToggleExpand,
}: {
  item: CollectionItem;
  parentId: string;
  onSelectRequest: SidebarProps['onSelectRequest'];
  onContextMenu: (
    e: React.MouseEvent,
    type: 'folder' | 'request',
    id: string,
    name: string,
    parentId?: string,
    requestData?: ContextMenu['requestData']
  ) => void;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  if (item.type === 'folder') {
    const expanded = expandedIds.has(item.id);
    const hasChildren = item.children.length > 0;
    return (
      <div
        className="collection-folder"
        onContextMenu={(e) => onContextMenu(e, 'folder', item.id, item.name)}
      >
        <div
          className={`collection-folder-row ${!hasChildren ? 'no-children' : ''}`}
          style={{ paddingLeft: depth * INDENT_PER_LEVEL }}
          role={hasChildren ? 'button' : undefined}
          tabIndex={hasChildren ? 0 : undefined}
          onClick={() => hasChildren && onToggleExpand(item.id)}
          onKeyDown={hasChildren ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleExpand(item.id);
            }
          } : undefined}
          aria-expanded={hasChildren ? expanded : undefined}
        >
          <span className={`tree-chevron ${expanded ? 'expanded' : ''} ${!hasChildren ? 'empty' : ''}`} aria-hidden>
            {hasChildren ? (expanded ? '▾' : '▸') : '○'}
          </span>
          <span className="folder-icon" aria-hidden>📁</span>
          <span className="folder-name">{item.name}</span>
        </div>
        {expanded && (
          <div className="collection-folder-children">
            {item.children.map((child) => (
              <CollectionNode
                key={child.id}
                item={child}
                parentId={item.id}
                onSelectRequest={onSelectRequest}
                onContextMenu={onContextMenu}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className="collection-request"
      style={{ paddingLeft: depth * INDENT_PER_LEVEL }}
      onClick={() =>
        onSelectRequest({
          id: item.id,
          name: item.name,
          method: item.method,
          url: item.url,
          params: item.params ?? defaultParams,
          headers: item.headers ?? defaultHeaders,
          body: item.body ?? null,
          parentId,
        })
      }
      onContextMenu={(e) =>
        onContextMenu(e, 'request', item.id, item.name, parentId, {
          method: item.method,
          url: item.url,
          params: item.params ?? defaultParams,
          headers: item.headers ?? defaultHeaders,
          body: item.body ?? null,
        })
      }
    >
      <span className="request-icon" aria-hidden>📄</span>
      <span className={`method-badge method-${(item.method || 'get').toLowerCase()}`}>
        {item.method}
      </span>
      <span className="request-name">{item.name}</span>
    </div>
  );
}

export function Sidebar({
  collections,
  loading = false,
  onRefresh,
  onNewRequestInFolder,
  onSelectRequest,
  collapsed,
}: SidebarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; current: string } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    collections.forEach((c) => ids.add(c.id));
    return ids;
  });

  const collectionIds = useMemo(() => collections.map((c) => c.id).join(','), [collections]);
  useEffect(() => {
    const collectExpandableIds = (items: CollectionItem[]): string[] => {
      const ids: string[] = [];
      for (const it of items) {
        if (it.type === 'folder') {
          ids.push(it.id);
          ids.push(...collectExpandableIds(it.children));
        }
      }
      return ids;
    };
    setExpandedIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      collections.forEach((c) => {
        if (!next.has(c.id)) {
          next.add(c.id);
          changed = true;
        }
        collectExpandableIds(c.children).forEach((id) => {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        });
      });
      return changed ? next : prev;
    });
  }, [collectionIds]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleContextMenu = useCallback(
    (
      e: React.MouseEvent,
      type: 'collection' | 'folder' | 'request',
      id: string,
      name: string,
      parentId?: string,
      requestData?: ContextMenu['requestData']
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, type, id, name, parentId, requestData });
    },
    []
  );

  const handleNewCollection = useCallback(async () => {
    if (!isTauri) return;
    const name = window.prompt('Collection name', 'New Collection');
    if (!name?.trim()) return;
    try {
      await createCollection(name.trim());
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  }, [onRefresh]);

  const handleNewFolder = useCallback(
    async (parentId: string) => {
      if (!isTauri) return;
      setContextMenu(null);
      const name = window.prompt('Folder name', 'New Folder');
      if (!name?.trim()) return;
      try {
        await createFolder(parentId, name.trim());
        onRefresh();
      } catch (err) {
        console.error(err);
        alert(String(err));
      }
    },
    [onRefresh]
  );

  const handleRename = useCallback(
    async (id: string, newName: string) => {
      if (!isTauri) return;
      setRenameTarget(null);
      setContextMenu(null);
      if (!newName.trim()) return;
      try {
        await renameItem(id, newName.trim());
        onRefresh();
      } catch (err) {
        console.error(err);
        alert(String(err));
      }
    },
    [onRefresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!isTauri) return;
      setContextMenu(null);
      if (!window.confirm('Delete this item?')) return;
      try {
        await deleteItem(id);
        onRefresh();
      } catch (err) {
        console.error(err);
        alert(String(err));
      }
    },
    [onRefresh]
  );

  const handleDuplicate = useCallback(
    async () => {
      if (!isTauri || !contextMenu || contextMenu.type !== 'request') return;
      const { parentId, requestData, name } = contextMenu;
      if (!parentId || !requestData) return;
      setContextMenu(null);
      try {
        await saveRequest(parentId, {
          name: `${name} (copy)`,
          method: requestData.method,
          url: requestData.url,
          params: requestData.params,
          headers: requestData.headers,
          body: requestData.body,
        });
        onRefresh();
      } catch (err) {
        console.error(err);
        alert(String(err));
      }
    },
    [contextMenu, onRefresh]
  );

  const runContextAction = useCallback(
    (action: string) => {
      if (action === 'new_collection') {
        setContextMenu(null);
        handleNewCollection();
        return;
      }
      if (!contextMenu) return;
      const { id } = contextMenu;
      if (action === 'new_folder') handleNewFolder(id);
      else if (action === 'new_request') {
        setContextMenu(null);
        onNewRequestInFolder?.(id);
      } else if (action === 'rename')
        setRenameTarget({ id, current: contextMenu.name });
      else if (action === 'delete') handleDelete(id);
      else if (action === 'duplicate') handleDuplicate();
      setContextMenu(null);
    },
    [contextMenu, handleNewFolder, handleDelete, onNewRequestInFolder, handleDuplicate]
  );

  if (collapsed) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Collections</h2>
        {isTauri && (
          <button
            type="button"
            className="sidebar-new-btn"
            onClick={handleNewCollection}
            title="New collection"
          >
            + New
          </button>
        )}
      </div>
      <div
        className="sidebar-content"
        onContextMenu={
          isTauri
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  type: 'collection',
                  id: '__sidebar__',
                  name: '',
                });
              }
            : undefined
        }
      >
        {loading ? (
          <div className="sidebar-loading">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="sidebar-empty">
            <p>No collections yet</p>
            {isTauri && (
              <button type="button" className="sidebar-empty-btn" onClick={handleNewCollection}>
                Create collection
              </button>
            )}
          </div>
        ) : (
          collections.map((col) => {
            const colExpanded = expandedIds.has(col.id);
            const hasChildren = col.children.length > 0;
            return (
              <div
                key={col.id}
                className="collection"
                onContextMenu={(e) => handleContextMenu(e, 'collection', col.id, col.name)}
              >
                <div
                  className={`collection-header ${!hasChildren ? 'no-children' : ''}`}
                  role={hasChildren ? 'button' : undefined}
                  tabIndex={hasChildren ? 0 : undefined}
                  onClick={() => hasChildren && toggleExpand(col.id)}
                  onKeyDown={hasChildren ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(col.id);
                    }
                  } : undefined}
                  aria-expanded={hasChildren ? colExpanded : undefined}
                >
                  <span className={`tree-chevron collection-chevron ${colExpanded ? 'expanded' : ''}`} aria-hidden>
                    {hasChildren ? (colExpanded ? '▾' : '▸') : '○'}
                  </span>
                  <span className="collection-icon" aria-hidden>📂</span>
                  <span className="collection-name">{col.name}</span>
                </div>
                {colExpanded && (
                  <div className="collection-children">
                    {col.children.map((item) => (
                      <CollectionNode
                        key={item.id}
                        item={item}
                        parentId={col.id}
                        onSelectRequest={onSelectRequest}
                        onContextMenu={handleContextMenu}
                        depth={0}
                        expandedIds={expandedIds}
                        onToggleExpand={toggleExpand}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {contextMenu && (
        <div
          className="sidebar-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'collection' && contextMenu.id === '__sidebar__' && (
            <button type="button" onClick={() => runContextAction('new_collection')}>
              New Collection
            </button>
          )}
          {contextMenu.type === 'collection' && contextMenu.id !== '__sidebar__' && (
            <>
              <button type="button" onClick={() => runContextAction('new_collection')}>
                New Collection
              </button>
              <button type="button" onClick={() => runContextAction('new_folder')}>
                New Folder
              </button>
              <button type="button" onClick={() => runContextAction('new_request')}>
                New Request
              </button>
              <button type="button" onClick={() => runContextAction('rename')}>
                Rename
              </button>
              <button type="button" onClick={() => runContextAction('delete')}>
                Delete
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button type="button" onClick={() => runContextAction('new_folder')}>
                New Folder
              </button>
              <button type="button" onClick={() => runContextAction('new_request')}>
                New Request
              </button>
              <button type="button" onClick={() => runContextAction('rename')}>
                Rename
              </button>
              <button type="button" onClick={() => runContextAction('delete')}>
                Delete
              </button>
            </>
          )}
          {contextMenu.type === 'request' && (
            <>
              <button type="button" onClick={() => runContextAction('duplicate')}>
                Duplicate
              </button>
              <button type="button" onClick={() => runContextAction('rename')}>
                Rename
              </button>
              <button type="button" onClick={() => runContextAction('delete')}>
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {renameTarget && (
        <div className="sidebar-rename-overlay" onClick={() => setRenameTarget(null)}>
          <div className="sidebar-rename-modal" onClick={(e) => e.stopPropagation()}>
            <label>New name</label>
            <input
              type="text"
              autoFocus
              defaultValue={renameTarget.current}
              placeholder="Name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename(renameTarget.id, (e.target as HTMLInputElement).value);
                }
                if (e.key === 'Escape') setRenameTarget(null);
              }}
              ref={(el) => el?.focus()}
            />
            <div className="sidebar-rename-actions">
              <button type="button" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRename(
                    renameTarget.id,
                    (document.querySelector('.sidebar-rename-modal input') as HTMLInputElement)
                      ?.value ?? ''
                  )
                }
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
