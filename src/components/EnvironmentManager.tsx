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
  const [modalEnv, setModalEnv] = useState<Environment | { name: string; variables: EnvVariable[] } | null>(null);
  const [isCreate, setIsCreate] = useState(false);

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

  const openCreate = () => {
    setIsCreate(true);
    setModalEnv({ name: 'New Environment', variables: [{ key: '', value: '' }] });
  };

  const openEdit = (env: Environment) => {
    setIsCreate(false);
    setModalEnv({ ...env, variables: env.variables?.length ? [...env.variables] : [{ key: '', value: '' }] });
  };

  const closeModal = () => {
    setModalEnv(null);
    setIsCreate(false);
  };

  const handleSave = async () => {
    if (!modalEnv || !isTauri) return;
    const vars = modalEnv.variables.filter((v) => v.key.trim());
    if (!modalEnv.name.trim()) return;
    try {
      if (isCreate) {
        const created = await createEnvironment(modalEnv.name.trim());
        if (vars.length > 0) {
          await updateEnvironment(created.id, { variables: vars });
        }
      } else {
        await updateEnvironment((modalEnv as Environment).id, {
          name: modalEnv.name.trim(),
          variables: vars,
        });
      }
      closeModal();
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

  const handleDelete = async (id: string) => {
    if (!isTauri) return;
    if (!window.confirm('Delete this environment? Variables will no longer be available.')) return;
    try {
      await deleteEnvironment(id);
      if (activeId === id) setActiveId(null);
      if (modalEnv && (modalEnv as Environment).id === id) closeModal();
      load();
    } catch (e) {
      alert(String(e));
    }
  };

  const addVariable = () => {
    if (!modalEnv) return;
    setModalEnv({
      ...modalEnv,
      variables: [...modalEnv.variables, { key: '', value: '' }],
    });
  };

  const updateVariable = (idx: number, kv: Partial<EnvVariable>) => {
    if (!modalEnv) return;
    const vars = [...modalEnv.variables];
    vars[idx] = { ...vars[idx], ...kv };
    setModalEnv({ ...modalEnv, variables: vars });
  };

  const removeVariable = (idx: number) => {
    if (!modalEnv) return;
    setModalEnv({
      ...modalEnv,
      variables: modalEnv.variables.filter((_, i) => i !== idx),
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (modalEnv) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalEnv]);

  if (!isTauri) return null;

  return (
    <div className="environment-manager">
      <h3>Environments</h3>
      <p className="env-hint">
        Use <code>{'{{variable}}'}</code> in URL, headers, or body. Select an environment to apply its variables.
      </p>

      <div className="env-select-row">
        <label htmlFor="env-active" className="env-select-label">Active environment</label>
        <div className="env-select-wrap">
          <select
            id="env-active"
            value={activeId ?? ''}
            onChange={(e) => handleSetActive(e.target.value || null)}
            className="env-select"
            aria-label="Active environment"
          >
            <option value="">None</option>
            {environments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button type="button" className="env-new-btn" onClick={openCreate} aria-label="Create environment">
            New environment
          </button>
        </div>
      </div>

      {environments.length === 0 ? (
        <div className="env-empty">
          <p>No environments yet.</p>
          <p className="env-empty-hint">Create one to use variables like <code>{'{{baseUrl}}'}</code> in your requests.</p>
          <button type="button" className="env-empty-btn" onClick={openCreate}>
            Create environment
          </button>
        </div>
      ) : (
        <ul className="env-list" role="list">
          {environments.map((env) => (
            <li key={env.id} className={`env-item ${env.id === activeId ? 'env-item-active' : ''}`}>
              <button
                type="button"
                className="env-item-main"
                onClick={() => handleSetActive(env.id)}
                title={env.id === activeId ? 'Active' : 'Set as active'}
              >
                <span className="env-item-name">{env.name}</span>
                <span className="env-item-meta">
                  {env.variables?.filter((v) => v.key?.trim()).length ?? 0} variables
                  {env.id === activeId && <span className="env-item-badge">Active</span>}
                </span>
              </button>
              <div className="env-item-actions">
                <button
                  type="button"
                  className="env-item-btn env-item-edit"
                  onClick={() => openEdit(env)}
                  aria-label={`Edit ${env.name}`}
                >
                  Edit
                </button>
                {env.id !== activeId ? (
                  <button
                    type="button"
                    className="env-item-btn env-item-delete"
                    onClick={() => handleDelete(env.id)}
                    aria-label={`Delete ${env.name}`}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalEnv && (
        <div className="env-edit-overlay" onClick={closeModal}>
          <div className="env-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{isCreate ? 'New environment' : 'Edit environment'}</h4>

            <label htmlFor="env-modal-name">Name</label>
            <input
              id="env-modal-name"
              type="text"
              value={modalEnv.name}
              onChange={(e) => setModalEnv({ ...modalEnv, name: e.target.value })}
              placeholder="e.g. Development"
              autoFocus
            />

            <div className="env-var-section">
              <div className="env-var-header">
                <label>Variables</label>
                <button type="button" className="env-add-var" onClick={addVariable}>
                  + Add variable
                </button>
              </div>
              <div className="env-var-table">
                <div className="env-var-row env-var-header-row">
                  <span className="env-var-col-key">Variable</span>
                  <span className="env-var-col-value">Value</span>
                  <span className="env-var-col-action" aria-hidden="true" />
                </div>
                {modalEnv.variables.map((v, i) => (
                  <div key={i} className="env-var-row">
                    <input
                      className="env-var-input-key"
                      placeholder="e.g. baseUrl"
                      value={v.key}
                      onChange={(e) => updateVariable(i, { key: e.target.value })}
                    />
                    <input
                      className="env-var-input-value"
                      placeholder="e.g. https://api.example.com"
                      value={v.value}
                      onChange={(e) => updateVariable(i, { value: e.target.value })}
                    />
                    <button
                      type="button"
                      className="env-var-remove"
                      onClick={() => removeVariable(i)}
                      aria-label="Remove variable"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="env-edit-actions">
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="env-save-btn"
                onClick={handleSave}
                disabled={!modalEnv.name.trim()}
              >
                {isCreate ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
