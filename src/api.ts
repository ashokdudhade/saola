import type { Collection, CollectionItem, HttpResponse } from './types';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri) throw new Error('Tauri only');
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
  return tauriInvoke<T>(cmd, args);
}

export async function getCollections(): Promise<Collection[]> {
  if (isTauri) return invoke<Collection[]>('get_collections');
  return [
    {
      id: '1',
      name: 'My Collection',
      children: [
        {
          type: 'folder',
          id: 'f1',
          name: 'API',
          children: [
            {
              type: 'request',
              id: 'r1',
              name: 'Get Users',
              method: 'GET',
              url: 'https://jsonplaceholder.typicode.com/users',
            },
          ],
        },
        {
          type: 'request',
          id: 'r2',
          name: 'Example Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
        },
      ],
    },
  ];
}

export async function sendRequest(request: {
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  params: { key: string; value: string; enabled: boolean }[];
  body: string | null;
}): Promise<HttpResponse> {
  if (isTauri) return invoke<HttpResponse>('send_request', { request });
  const enabledHeaders = request.headers.filter((h) => h.enabled && h.key.trim());
  const headers: Record<string, string> = {};
  enabledHeaders.forEach((h) => (headers[h.key] = h.value));

  const res = await fetch(request.url, {
    method: request.method,
    headers,
    body: request.body ?? undefined,
  });

  const respHeaders: { key: string; value: string; enabled: boolean }[] = [];
  res.headers.forEach((v, k) => respHeaders.push({ key: k, value: v, enabled: true }));

  return {
    status: res.status,
    statusText: res.statusText,
    headers: respHeaders,
    body: await res.text(),
  };
}

export async function createCollection(name: string): Promise<Collection> {
  return invoke<Collection>('create_collection', { name });
}

export async function createFolder(parentId: string, name: string): Promise<CollectionItem> {
  return invoke<CollectionItem>('create_folder', { parent_id: parentId, name });
}

export async function saveRequest(
  parentId: string,
  request: {
    id?: string;
    name: string;
    method: string;
    url: string;
    params: { key: string; value: string; enabled: boolean }[];
    headers: { key: string; value: string; enabled: boolean }[];
    body: string | null;
  }
): Promise<CollectionItem> {
  return invoke<CollectionItem>('save_request', {
    parent_id: parentId,
    request: {
      id: request.id || null,
      name: request.name,
      method: request.method,
      url: request.url,
      params: request.params,
      headers: request.headers,
      body: request.body,
    },
  });
}

export async function renameItem(id: string, newName: string): Promise<void> {
  return invoke('rename_item', { id, new_name: newName });
}

export async function deleteItem(id: string): Promise<void> {
  return invoke('delete_item', { id });
}
