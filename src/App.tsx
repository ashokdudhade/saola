import { useState, useCallback, useEffect } from 'react';
import { sendRequest, getCollections, saveRequest, isTauri, getStorageProvider } from './api';
import { Sidebar } from './components/Sidebar';
import { RequestTabs } from './components/RequestTabs';
import { RequestBuilder } from './components/RequestBuilder';
import { ResponseView } from './components/ResponseView';
import { StorageSettings } from './components/StorageSettings';
import { EnvironmentManager } from './components/EnvironmentManager';
import { GlobalSearch } from './components/GlobalSearch';
import { SaveToCollectionModal } from './components/SaveToCollectionModal';
import { RequestLogsPanel, type RequestLogEntry } from './components/RequestLogsPanel';
import { CodeSnippetModal } from './components/CodeSnippetModal';
import type { Collection, CollectionItem, HttpResponse, RequestTab, HeaderPair, ParamPair } from './types';
import './App.css';

interface TabData {
  method: string;
  url: string;
  params: ParamPair[];
  headers: HeaderPair[];
  body: string | null;
}

function generateId() {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function findRequestName(collections: Collection[], requestId: string): string | null {
  for (const col of collections) {
    for (const item of col.children) {
      if (item.type === 'request' && item.id === requestId) return item.name;
      if (item.type === 'folder') {
        const found = findRequestInItems(item.children, requestId);
        if (found) return found;
      }
    }
  }
  return null;
}
function findRequestInItems(items: CollectionItem[], requestId: string): string | null {
  for (const item of items) {
    if (item.type === 'request' && item.id === requestId) return item.name;
    if (item.type === 'folder') {
      const found = findRequestInItems(item.children, requestId);
      if (found) return found;
    }
  }
  return null;
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabs, setTabs] = useState<RequestTab[]>([]);
  const [tabData, setTabData] = useState<Record<string, TabData>>({});
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false);
  const [tabLinks, setTabLinks] = useState<Record<string, { requestId: string; parentId: string }>>({});
  const [storageProvider, setStorageProvider] = useState<string>('local');
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([]);
  const [logsPanelOpen, setLogsPanelOpen] = useState(false);
  const [codeSnippetOpen, setCodeSnippetOpen] = useState(false);

  const refreshCollections = useCallback(() => {
    setCollectionsLoading(true);
    getCollections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setCollectionsLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'Saola';
    if (isTauri) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().setTitle('Saola');
      });
    }
  }, []);

  useEffect(() => {
    if (isTauri) {
      getStorageProvider()
        .then((s) => setStorageProvider(s.provider))
        .catch(() => {});
    }
  }, [settingsOpen]);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  useEffect(() => {
    if (collections.length === 0) return;
    setTabs((prev) =>
      prev.map((tab) => {
        const link = tabLinks[tab.id];
        if (!link) return tab;
        const name = findRequestName(collections, link.requestId);
        if (name != null && name !== tab.name) {
          return { ...tab, name };
        }
        return tab;
      })
    );
  }, [collections, tabLinks]);

  const ensureTab = useCallback(() => {
    if (tabs.length === 0) {
      const id = generateId();
      const newTab: RequestTab = {
        id,
        name: 'New Request',
        method: 'GET',
        url: 'https://httpbin.org/get',
      };
      setTabs([newTab]);
      setTabData({
        [id]: {
          method: 'GET',
          url: 'https://httpbin.org/get',
          params: [{ key: '', value: '', enabled: true }],
          headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
          body: null,
        },
      });
      setActiveTabId(id);
    }
  }, [tabs.length]);

  useEffect(() => {
    ensureTab();
  }, [ensureTab]);

  const addTab = useCallback(() => {
    const id = generateId();
    const newTab: RequestTab = {
      id,
      name: 'New Request',
      method: 'GET',
      url: 'https://httpbin.org/get',
    };
    setTabs((prev) => [...prev, newTab]);
    setTabData((prev) => ({
      ...prev,
      [id]: {
        method: 'GET',
        url: 'https://httpbin.org/get',
        params: [{ key: '', value: '', enabled: true }],
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        body: null,
      },
    }));
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabLinks((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      const wasActive = activeTabId === id;
      if (wasActive && next.length > 0) {
        setActiveTabId(next[0].id);
      } else if (next.length === 0) {
        setActiveTabId(null);
      }
      return next;
    });
    setTabData((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, [activeTabId]);

  const handleSelectRequest = useCallback(
    (req: {
      id: string;
      name: string;
      method: string;
      url: string;
      params: ParamPair[];
      headers: HeaderPair[];
      body: string | null;
      parentId: string;
    }) => {
      const id = activeTabId ?? generateId();
      if (!activeTabId) {
        const newTab: RequestTab = { id, name: req.name, method: req.method, url: req.url };
        setTabs([newTab]);
        setActiveTabId(id);
      } else {
        setTabs((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name: req.name, method: req.method, url: req.url } : t))
        );
      }
      setTabData((prev) => ({
        ...prev,
        [id]: {
          method: req.method,
          url: req.url,
          params: req.params,
          headers: req.headers,
          body: req.body,
        },
      }));
      setTabLinks((prev) => ({ ...prev, [id]: { requestId: req.id, parentId: req.parentId } }));
    },
    [activeTabId]
  );

  const handleSend = useCallback(async () => {
    if (!activeTabId) return;
    const data = tabData[activeTabId];
    if (!data) return;

    const buildUrl = () => {
      const enabled = data.params.filter((p) => p.enabled && p.key.trim());
      if (enabled.length === 0) return data.url;
      try {
        const u = new URL(data.url);
        enabled.forEach((p) => u.searchParams.set(p.key, p.value));
        return u.toString();
      } catch {
        return data.url;
      }
    };
    const url = buildUrl();
    const headers = data.headers.filter((h) => h.enabled && h.key.trim());
    const body = ['POST', 'PUT', 'PATCH'].includes(data.method) ? data.body : null;

    setLoading(true);
    setResponse(null);
    setError(null);
    const start = performance.now();
    const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      const res = await sendRequest({
        method: data.method,
        url,
        headers,
        params: data.params,
        body,
      });
      const durationMs = Math.round(performance.now() - start);
      setResponse(res);
      setRequestLogs((prev) => [
        ...prev,
        {
          id: logId,
          timestamp: Date.now(),
          requestName: tabs.find((t) => t.id === activeTabId)?.name ?? 'Request',
          method: data.method,
          url,
          headers,
          body,
          status: res.status,
          statusText: res.statusText,
          responseHeaders: res.headers,
          responseBody: res.body,
          durationMs,
        },
      ]);
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      setError(String(err));
      setRequestLogs((prev) => [
        ...prev,
        {
          id: logId,
          timestamp: Date.now(),
          requestName: tabs.find((t) => t.id === activeTabId)?.name ?? 'Request',
          method: data.method,
          url,
          headers,
          body,
          durationMs,
          error: String(err),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeTabId, tabData, tabs]);

  const handleSave = useCallback(async () => {
    if (!activeTabId || !isTauri) return;
    const data = tabData[activeTabId];
    if (!data) return;
    const link = tabLinks[activeTabId];
    if (link) {
      try {
        await saveRequest(link.parentId, {
          id: link.requestId,
          name: tabs.find((t) => t.id === activeTabId)?.name ?? (data.url || 'Request'),
          method: data.method,
          url: data.url,
          params: data.params,
          headers: data.headers,
          body: data.body,
        });
        refreshCollections();
      } catch (err) {
        alert(String(err));
      }
    } else {
      setSaveModalOpen(true);
    }
  }, [activeTabId, tabData, tabLinks, tabs, refreshCollections]);

  const handleSaveAs = useCallback(() => {
    setSaveAsModalOpen(true);
  }, []);

  const handleNewRequestInFolder = useCallback(
    async (parentId: string) => {
      if (!isTauri) return;
      try {
        const saved = await saveRequest(parentId, {
          name: 'New Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          params: [{ key: '', value: '', enabled: true }],
          headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
          body: null,
        });
        if (saved.type === 'request') {
          const id = generateId();
          const newTab: RequestTab = {
            id,
            name: saved.name,
            method: saved.method,
            url: saved.url,
          };
          setTabs((prev) => [...prev, newTab]);
          setTabData((prev) => ({
            ...prev,
            [id]: {
              method: saved.method,
              url: saved.url,
              params: saved.params ?? [{ key: '', value: '', enabled: true }],
              headers: saved.headers ?? [{ key: 'Content-Type', value: 'application/json', enabled: true }],
              body: saved.body ?? null,
            },
          }));
          setTabLinks((prev) => ({
            ...prev,
            [id]: { requestId: saved.id, parentId },
          }));
          setActiveTabId(id);
          refreshCollections();
        }
      } catch (err) {
        alert(String(err));
      }
    },
    [refreshCollections]
  );

  const handleSaveToLocation = useCallback(
    async (parentId: string, name: string) => {
      if (!activeTabId || !isTauri) return;
      const data = tabData[activeTabId];
      if (!data) return;
      try {
        const saved = await saveRequest(parentId, {
          name,
          method: data.method,
          url: data.url,
          params: data.params,
          headers: data.headers,
          body: data.body,
        });
        if (saved.type === 'request') {
          setTabLinks((prev) => ({
            ...prev,
            [activeTabId]: { requestId: saved.id, parentId },
          }));
        }
        refreshCollections();
        setSaveModalOpen(false);
      } catch (err) {
        alert(String(err));
      }
    },
    [activeTabId, tabData, refreshCollections]
  );

  const handleSaveAsToLocation = useCallback(
    async (parentId: string, name: string) => {
      if (!activeTabId || !isTauri) return;
      const data = tabData[activeTabId];
      if (!data) return;
      try {
        await saveRequest(parentId, {
          name,
          method: data.method,
          url: data.url,
          params: data.params,
          headers: data.headers,
          body: data.body,
        });
        refreshCollections();
        setSaveAsModalOpen(false);
      } catch (err) {
        alert(String(err));
      }
    },
    [activeTabId, tabData, refreshCollections]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed((c) => !c);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSend, handleSave]);

  const activeData = activeTabId ? tabData[activeTabId] : null;
  const isLinkedTab = activeTabId ? !!tabLinks[activeTabId] : false;

  const updateTabData = useCallback((updates: Partial<TabData>) => {
    if (!activeTabId) return;
    setTabData((prev) => {
      const current = prev[activeTabId];
      if (!current) return prev;
      return { ...prev, [activeTabId]: { ...current, ...updates } };
    });
    if (updates.method || updates.url || updates.method) {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                method: updates.method ?? t.method,
                url: updates.url ?? t.url,
              }
            : t
        )
      );
    }
  }, [activeTabId]);

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Show sidebar (Ctrl+\\)' : 'Hide sidebar (Ctrl+\\)'}
          aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>
        <h1 className="app-title">Saola</h1>
        <span
          className="privacy-indicator"
          title={`Sync destination: ${storageProvider === 's3' ? 'AWS S3' : storageProvider === 'gdrive' ? 'Google Drive' : 'Local storage'}`}
        >
          {storageProvider === 's3' ? 'S3' : storageProvider === 'gdrive' ? 'G-Drive' : 'Local'}
        </span>
        <button
          type="button"
          className={`logs-btn ${logsPanelOpen ? 'active' : ''}`}
          onClick={() => setLogsPanelOpen(!logsPanelOpen)}
          title="Request logs"
          aria-label="Toggle request logs"
        >
          📋
        </button>
        <button
          type="button"
          className="settings-btn"
          onClick={() => setSettingsOpen(!settingsOpen)}
          title="Storage settings"
          aria-label="Storage settings"
        >
          ⚙
        </button>
      </header>
      <RequestLogsPanel
        logs={requestLogs}
        open={logsPanelOpen}
        onClose={() => setLogsPanelOpen(false)}
      />
      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      {settingsOpen && (
        <div className="settings-panel">
          <EnvironmentManager />
          <StorageSettings
            onImportComplete={refreshCollections}
            onProviderChange={setStorageProvider}
          />
        </div>
      )}

      <SaveToCollectionModal
        open={saveModalOpen}
        collections={collections}
        defaultName={tabs.find((t) => t.id === activeTabId)?.name ?? 'Request'}
        onSave={handleSaveToLocation}
        onClose={() => setSaveModalOpen(false)}
      />

      <SaveToCollectionModal
        open={saveAsModalOpen}
        collections={collections}
        defaultName={tabs.find((t) => t.id === activeTabId)?.name ?? 'Request'}
        onSave={() => {}}
        onSaveAs={handleSaveAsToLocation}
        saveAsMode
        onClose={() => setSaveAsModalOpen(false)}
      />

      <CodeSnippetModal
        open={codeSnippetOpen}
        request={activeData ? { method: activeData.method, url: activeData.url, params: activeData.params, headers: activeData.headers, body: activeData.body } : null}
        onClose={() => setCodeSnippetOpen(false)}
      />

      <div className="app-body">
        <Sidebar
          collections={collections}
          loading={collectionsLoading}
          onRefresh={refreshCollections}
          onNewRequestInFolder={handleNewRequestInFolder}
          onSelectRequest={handleSelectRequest}
          collapsed={sidebarCollapsed}
        />
        <main className="main-content">
          <RequestTabs
            tabs={tabs}
            activeId={activeTabId}
            onSelect={setActiveTabId}
            onClose={closeTab}
            onNew={addTab}
          />
          <div className="main-content-inner">
            {activeData ? (
              <>
                <RequestBuilder
                  method={activeData.method}
                  url={activeData.url}
                  params={activeData.params}
                  headers={activeData.headers}
                  body={activeData.body}
                  onMethodChange={(m) => updateTabData({ method: m })}
                  onUrlChange={(u) => updateTabData({ url: u })}
                  onParamsChange={(p) => updateTabData({ params: p })}
                  onHeadersChange={(h) => updateTabData({ headers: h })}
                  onBodyChange={(b) => updateTabData({ body: b })}
                  onSend={handleSend}
                  isLoading={loading}
                  onSave={isTauri ? handleSave : undefined}
                  onSaveAs={isTauri && isLinkedTab ? handleSaveAs : undefined}
                  onCode={() => setCodeSnippetOpen(true)}
                />
                <ResponseView response={response} isLoading={loading} error={error} />
              </>
            ) : (
              <div className="empty-state">
                <p>No request open. Click a request in the sidebar or create a new tab.</p>
                <button type="button" onClick={addTab}>New Request</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
