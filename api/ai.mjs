// Serverless proxy for LLM calls (Vercel function: /api/ai)
//
// Purpose:
//   The client bundle must NEVER contain the Base44 API key. All LLM calls go
//   through this function, which forwards them to Base44 with the key held
//   server-side only (process.env.BASE44_API_KEY).
//
// Security measures:
//   - Origin allowlist (ALLOWED_ORIGINS env var)
//   - Strict model allowlist (only models this app is allowed to use)
//   - Payload validation (prompt required, size limits, file count/size limits)
//   - No caching of AI responses

const APP_ID = process.env.BASE44_APP_ID || '';
const API_KEY = process.env.BASE44_API_KEY || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_MODELS = new Set(['gemini_3_flash']);

const MAX_PROMPT_CHARS = 20000;
const MAX_FILES = 3;
const MAX_FILE_CHARS = 6000000; // ~4.5 MB of base64 is roughly the Vercel body ceiling
const UPSTREAM_TIMEOUT_MS = 90000;

const BASE44_ENDPOINT = `https://base44.app/api/apps/${APP_ID}/integration-endpoints/Core/InvokeLLM`;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function originAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) => {
    const starIdx = allowed.indexOf('*.');
    if (starIdx !== -1) {
      const suffix = allowed.slice(starIdx + 1);
      return origin.length > suffix.length && origin.endsWith(suffix);
    }
    return origin === allowed;
  });
}

function send(res, status, contentType, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}

export default async function handler(req, res) {
  if (!APP_ID || !API_KEY) {
    send(res, 500, 'application/json', JSON.stringify({ error: 'AI service is not configured.' }));
    return;
  }

  if (ALLOWED_ORIGINS.length > 0) {
    const origin = req.headers.origin || '';
    if (!originAllowed(origin)) {
      send(res, 403, 'application/json', JSON.stringify({ error: 'Forbidden origin.' }));
      return;
    }
  }

  if (req.method !== 'POST') {
    send(res, 405, 'application/json', JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  const raw = await readBody(req);
  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    send(res, 400, 'application/json', JSON.stringify({ error: 'Invalid JSON body.' }));
    return;
  }

  const { model, prompt, response_json_schema } = body;

  if (!ALLOWED_MODELS.has(model)) {
    send(res, 400, 'application/json', JSON.stringify({ error: 'Model not allowed.' }));
    return;
  }
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    send(res, 400, 'application/json', JSON.stringify({ error: 'Prompt is required.' }));
    return;
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    send(res, 400, 'application/json', JSON.stringify({ error: 'Prompt too long.' }));
    return;
  }

  const payload = { model, prompt };
  if (Array.isArray(body.file_urls)) {
    const files = body.file_urls
      .filter((f) => typeof f === 'string')
      .slice(0, MAX_FILES);
    if (files.some((f) => f.length > MAX_FILE_CHARS)) {
      send(res, 400, 'application/json', JSON.stringify({ error: 'File too large.' }));
      return;
    }
    if (files.length > 0) payload.file_urls = files;
  }
  if (response_json_schema !== undefined) {
    payload.response_json_schema = response_json_schema;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(BASE44_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        api_key: API_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const upstreamBody = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';
    send(res, upstream.status, contentType, upstreamBody);
  } catch {
    send(res, 502, 'application/json', JSON.stringify({ error: 'AI provider request failed.' }));
  } finally {
    clearTimeout(timer);
  }
}
