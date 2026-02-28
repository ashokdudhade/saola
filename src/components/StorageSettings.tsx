import { useState } from 'react';
import './StorageSettings.css';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri) throw new Error('Tauri only');
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
  return tauriInvoke<T>(cmd, args as Record<string, unknown>);
}

type Provider = 'local' | 'gdrive' | 's3';

export function StorageSettings() {
  const [provider, setProvider] = useState<Provider>('local');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Region, setS3Region] = useState('us-east-1');
  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [encryptTest, setEncryptTest] = useState<string | null>(null);

  const handleSaveS3 = async () => {
    try {
      await invoke('configure_s3', {
        config: {
          bucket: s3Bucket,
          region: s3Region,
          accessKeyId: s3AccessKey,
          secretAccessKey: s3SecretKey,
        },
      });
      setSyncStatus('S3 configured');
    } catch (e) {
      setSyncStatus(`Error: ${e}`);
    }
  };

  const handleEncryptTest = async () => {
    if (!masterPassword) return;
    try {
      const testData = JSON.stringify({ test: true });
      const encrypted = await invoke<{ encrypted: string }>('encrypt_collections', {
        json: testData,
        masterPassword,
      });
      const decrypted = await invoke<string>('decrypt_collections', {
        encryptedBase64: encrypted.encrypted,
        masterPassword,
      });
      setEncryptTest(decrypted === testData ? 'E2EE OK' : 'E2EE failed');
    } catch (e) {
      setEncryptTest(`Error: ${e}`);
    }
  };

  const handleSync = async (direction: 'push' | 'pull') => {
    try {
      const cmd = direction === 'push' ? 'sync_push' : 'sync_pull';
      const result = await invoke<string>(cmd);
      setSyncStatus(result);
    } catch (e) {
      setSyncStatus(`Error: ${e}`);
    }
  };

  return (
    <div className="storage-settings">
      <h3>Storage Provider</h3>
      <div className="provider-options">
        <label>
          <input
            type="radio"
            name="provider"
            checked={provider === 'local'}
            onChange={() => setProvider('local')}
          />
          Local only
        </label>
        <label>
          <input
            type="radio"
            name="provider"
            checked={provider === 'gdrive'}
            onChange={() => setProvider('gdrive')}
          />
          Google Drive (Phase 2)
        </label>
        <label>
          <input
            type="radio"
            name="provider"
            checked={provider === 's3'}
            onChange={() => setProvider('s3')}
          />
          AWS S3
        </label>
      </div>

      {provider === 's3' && (
        <div className="s3-config">
          <input
            placeholder="Bucket name"
            value={s3Bucket}
            onChange={(e) => setS3Bucket(e.target.value)}
          />
          <input
            placeholder="Region"
            value={s3Region}
            onChange={(e) => setS3Region(e.target.value)}
          />
          <input
            type="password"
            placeholder="Access Key ID"
            value={s3AccessKey}
            onChange={(e) => setS3AccessKey(e.target.value)}
          />
          <input
            type="password"
            placeholder="Secret Access Key"
            value={s3SecretKey}
            onChange={(e) => setS3SecretKey(e.target.value)}
          />
          <button type="button" onClick={handleSaveS3}>
            Save S3 Config
          </button>
        </div>
      )}

      {provider !== 'local' && (
        <div className="sync-actions">
          <button type="button" onClick={() => handleSync('push')}>
            Push to Cloud
          </button>
          <button type="button" onClick={() => handleSync('pull')}>
            Pull from Cloud
          </button>
        </div>
      )}

      <div className="master-password">
        <h4>Master Password (E2EE)</h4>
        <input
          type="password"
          placeholder="Master password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button type="button" onClick={handleEncryptTest}>
          Test E2EE
        </button>
        {encryptTest && <span>{encryptTest}</span>}
      </div>

      <div className="import-export">
        <h4>Import / Export</h4>
        <input
          type="file"
          accept=".json"
          id="postman-import"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const text = await f.text();
            try {
              const result = await invoke<{ collections: number; requests: number }>(
                'import_postman',
                { json: text }
              );
              setSyncStatus(`Imported: ${result.collections} collections, ${result.requests} requests`);
            } catch (err) {
              setSyncStatus(`Import error: ${err}`);
            }
            e.target.value = '';
          }}
        />
        <button type="button" onClick={() => document.getElementById('postman-import')?.click()}>
          Import Postman v2.1
        </button>
      </div>

      {syncStatus && <p className="sync-status">{syncStatus}</p>}
    </div>
  );
}
