import { useState, useEffect, useCallback } from 'react';
import {
  getEnvironments,
  getActiveEnvironment,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
  isTauri,
} from '../api';
import type { Environment, EnvVariable } from '../types';
import './EnvironmentManager.css';

export function EnvironmentManager() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Environment | null>(null);

  const load = useCallback(async () => {
    if (!isTauri) return;
    try {
      const [envs, active] = await Promise.all([
        getEnvironments(),
        getActiveEnvironment(),
      ]);
      setEnvironments(envs);
      setActiveId(active?.id ?? null);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!isTauri) return;
    const name = window.prompt('Environment name', 'New Environment');
    if (!name?.trim()) return;
    try {
      await createEnvironment(name.trim());
      load();
    } catch (e) {
      alert(String(e));
    }
  };

  const handleSetActive = async (id: string | null) => {
    if (!isTauri) return;
    try {
      await setActiveEnvironment(id);
      setActiveId(id);
    } catch (e) {
      alert(String(e));
    }
  };

  const handleEdit = (env: Environment) => {
    setEditing(env);
  };

  const handleSaveEdit = async () => {
    if (!editing || !isTauri) return;
    try {
      await updateEnvironment(editing.id, {
        name: editing.name,
        variables: editing.variables,
      });
      setEditing(null);
      load();
    } catch (e) {
      alert(String(e));
    }
  };

  const handleDelete = async (id: string) => {
    if (!isTauri) return;
    if (!window.confirm('Delete this environment?')) return;
    try {
      await deleteEnvironment(id);
      if (activeId === id) setActiveId(null);
      setEditing(null);
      load();
    } catch (e) {
      alert(String(e));
    }
  };

  const addVariable = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      variables: [...editing.variables, { key: '', value: '' }],
    });
  };

  const updateVariable = (idx: number, kv: Partial<EnvVariable>) => {
    if (!editing) return;
    const vars = [...editing.variables];
    vars[idx] = { ...vars[idx], ...kv };
    setEditing({ ...editing, variables: vars });
  };

  const removeVariable = (idx: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      variables: editing.variables.filter((_, i) => i !== idx),
    });
  };

  if (!isTauri) return null;

  return (
    <div className="environment-manager">
      <h3>Environments</h3>
      <p className="env-hint">
        Use <code>{'{{variable}}'}</code> in URL, headers, or body to substitute values.
      </p>
      <div className="env-list">
        <select
          value={activeId ?? ''}
          onChange={(e) => handleSetActive(e.target.value || null)}
          className="env-select"
        >
          <option value="">No environment</option>
          {environments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button type="button" className="env-new-btn" onClick={handleCreate}>
          New
        </button>
      </div>
      <div className="env-items">
        {environments.map((env) => (
          <div key={env.id} className="env-item">
            <span className="env-item-name">{env.name}</span>
            <button type="button" onClick={() => handleEdit(env)}>
              Edit
            </button>
            {env.id !== activeId && (
              <button type="button" onClick={() => handleDelete(env.id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="env-edit-overlay" onClick={() => setEditing(null)}>
          <div className="env-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit: {editing.name}</h4>
            <label>Name</label>
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <label>Variables</label>
            {editing.variables.map((v, i) => (
              <div key={i} className="env-var-row">
                <input
                  placeholder="key"
                  value={v.key}
                  onChange={(e) => updateVariable(i, { key: e.target.value })}
                />
                <input
                  placeholder="value"
                  value={v.value}
                  onChange={(e) => updateVariable(i, { value: e.target.value })}
                />
                <button type="button" onClick={() => removeVariable(i)}>
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addVariable} className="env-add-var">
              + Add variable
            </button>
            <div className="env-edit-actions">
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
