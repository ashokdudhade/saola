import type { HeaderPair, ParamPair } from '../types';

export interface RequestInput {
  method: string;
  url: string;
  params: ParamPair[];
  headers: HeaderPair[];
  body: string | null;
}

function buildFullUrl(url: string, params: ParamPair[]): string {
  const enabled = params.filter((p) => p.enabled && p.key.trim());
  if (enabled.length === 0) return url;
  try {
    const u = new URL(url);
    enabled.forEach((p) => u.searchParams.set(p.key, p.value));
    return u.toString();
  } catch {
    return url;
  }
}

function getEnabledHeaders(headers: HeaderPair[]): { key: string; value: string }[] {
  return headers
    .filter((h) => h.enabled && h.key.trim())
    .map((h) => ({ key: h.key, value: h.value }));
}

export function generateCurl(req: RequestInput): string {
  const fullUrl = buildFullUrl(req.url, req.params);
  const headers = getEnabledHeaders(req.headers);
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body?.trim();

  const parts: string[] = ['curl'];
  parts.push(`-X ${req.method}`);
  headers.forEach((h) => parts.push(`-H "${h.key}: ${h.value.replace(/"/g, '\\"')}"`));
  if (hasBody) {
    const escaped = req.body!.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    parts.push(`-d "${escaped}"`);
  }
  parts.push(`"${fullUrl}"`);
  return parts.join(' \\\n  ');
}

export function generateFetch(req: RequestInput): string {
  const fullUrl = buildFullUrl(req.url, req.params);
  const headers = getEnabledHeaders(req.headers);
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body?.trim();

  const headersObj =
    headers.length > 0
      ? `{\n${headers.map((h) => `  "${h.key}": "${h.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n')}\n}`
      : '{}';

  let bodyPart = '';
  if (hasBody) {
    bodyPart = `,\n  body: ${JSON.stringify(req.body)}`;
  }

  return `fetch("${fullUrl}", {
  method: "${req.method}",\n  headers: ${headersObj}${bodyPart}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
}

export function generatePython(req: RequestInput): string {
  const fullUrl = buildFullUrl(req.url, req.params);
  const headers = getEnabledHeaders(req.headers);
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body?.trim();

  const headersDict =
    headers.length > 0
      ? `{\n${headers.map((h) => `    "${h.key}": "${h.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n')}\n}`
      : '{}';

  let bodyPart = '';
  if (hasBody) {
    bodyPart = `\n    data=${JSON.stringify(req.body!)},\n`;
  }

  return `import requests

response = requests.${req.method.toLowerCase()}(
    ${JSON.stringify(fullUrl)},\n    headers=${headersDict}${bodyPart})
print(response.json())`;
}

export type SnippetLang = 'curl' | 'javascript' | 'python';

export const SNIPPET_LANGUAGES: { id: SnippetLang; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript (fetch)' },
  { id: 'python', label: 'Python (requests)' },
];

export function generateSnippet(req: RequestInput, lang: SnippetLang): string {
  switch (lang) {
    case 'curl':
      return generateCurl(req);
    case 'javascript':
      return generateFetch(req);
    case 'python':
      return generatePython(req);
    default:
      return generateCurl(req);
  }
}
