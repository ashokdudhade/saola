import { useState } from 'react';
import type { HeaderPair, ParamPair } from '../types';
import { CodeEditor } from './CodeEditor';
import './RequestBuilder.css';

type BuilderTab = 'params' | 'auth' | 'headers' | 'body';

interface RequestBuilderProps {
  method: string;
  url: string;
  params: ParamPair[];
  headers: HeaderPair[];
  body: string | null;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
  onParamsChange: (params: ParamPair[]) => void;
  onHeadersChange: (headers: HeaderPair[]) => void;
  onBodyChange: (body: string | null) => void;
  onSend: () => void;
  isLoading?: boolean;
  onSave?: () => void;
  onSaveAs?: () => void;
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function KvList({
  items,
  onChange,
  type,
}: {
  items: { key: string; value: string; enabled: boolean }[];
  onChange: (items: { key: string; value: string; enabled: boolean }[]) => void;
  type: 'params' | 'headers';
}) {
  const update = (index: number, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const add = () => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="kv-list">
      {items.map((item, i) => (
        <div key={i} className="kv-row">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => update(i, 'enabled', e.target.checked)}
            aria-label={`Enable ${type} ${i + 1}`}
          />
          <input
            type="text"
            placeholder="Key"
            value={item.key}
            onChange={(e) => update(i, 'key', e.target.value)}
          />
          <input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => update(i, 'value', e.target.value)}
          />
          <button type="button" className="kv-remove" onClick={() => remove(i)} aria-label="Remove">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="add-row" onClick={add}>
        + Add {type === 'params' ? 'param' : 'header'}
      </button>
    </div>
  );
}

export function RequestBuilder({
  method,
  url,
  params,
  headers,
  body,
  onMethodChange,
  onUrlChange,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
  onSend,
  isLoading = false,
  onSave,
  onSaveAs,
}: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<BuilderTab>('params');

  const tabs: { id: BuilderTab; label: string }[] = [
    { id: 'params', label: 'Params' },
    { id: 'auth', label: 'Auth' },
    { id: 'headers', label: 'Headers' },
    { id: 'body', label: 'Body' },
  ];

  return (
    <div className="request-builder">
      <div className="request-line">
        <select
          className="method-select"
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="url-input"
          placeholder="https://api.example.com/endpoint"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        {onSave && (
          <button
            type="button"
            className="save-btn"
            onClick={onSave}
            title="Save (Ctrl+S)"
          >
            Save
          </button>
        )}
        {onSaveAs && (
          <button
            type="button"
            className="save-as-btn"
            onClick={onSaveAs}
            title="Save as (create new request)"
          >
            Save as
          </button>
        )}
        <button
          type="button"
          className="send-btn"
          onClick={onSend}
          disabled={isLoading}
          title="Send request (⌘ Enter)"
        >
          {isLoading ? 'Sending...' : 'Send'}
          <span className="kbd-hint">⌘↵</span>
        </button>
      </div>

      <div className="request-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="request-panel">
        {activeTab === 'params' && (
          <KvList items={params} onChange={onParamsChange as (p: ParamPair[]) => void} type="params" />
        )}
        {activeTab === 'auth' && (
          <div className="auth-placeholder">
            Auth: Add Bearer token in Headers, or configure Basic auth later.
          </div>
        )}
        {activeTab === 'headers' && (
          <KvList items={headers} onChange={onHeadersChange as (h: HeaderPair[]) => void} type="headers" />
        )}
        {activeTab === 'body' && (
          <div className="body-editor">
            <CodeEditor
              value={body ?? '{}'}
              onChange={(v) => onBodyChange(v || null)}
              placeholder="{}"
            />
          </div>
        )}
      </div>
    </div>
  );
}
