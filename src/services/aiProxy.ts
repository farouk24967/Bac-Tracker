/// <reference types="vite/client" />

const AI_ENDPOINT = '/api/ai';

interface InvokeParams {
  model: string;
  prompt: string;
  file_urls?: string[];
  response_json_schema?: unknown;
}

/**
 * Calls the serverless AI proxy (/api/ai). The API key lives server-side only,
 * so it never ships inside the client bundle.
 */
export async function invokeAI(params: InvokeParams): Promise<any> {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) detail = data.error;
    } catch {
      // ignore non-JSON error body
    }
    throw new Error(`AI service error: ${detail}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
