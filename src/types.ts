export interface Collection {
  id: string;
  name: string;
  children: CollectionItem[];
}

export type CollectionItem =
  | { type: 'folder'; id: string; name: string; children: CollectionItem[] }
  | {
      type: 'request';
      id: string;
      name: string;
      method: string;
      url: string;
      params?: ParamPair[];
      headers?: HeaderPair[];
      body?: string | null;
    };

export interface HeaderPair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParamPair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HttpRequest {
  method: string;
  url: string;
  headers: HeaderPair[];
  params: ParamPair[];
  body: string | null;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: HeaderPair[];
  body: string;
}

export interface RequestTab {
  id: string;
  name: string;
  method: string;
  url: string;
}

export interface EnvVariable {
  key: string;
  value: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}
