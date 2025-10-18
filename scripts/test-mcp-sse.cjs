// Simple MCP SSE test script for local/ngrok endpoint (CommonJS)
// Usage: node scripts/test-mcp-sse.cjs [BASE_URL]

const fs = require('node:fs');
const { TextDecoder } = require('node:util');

async function readSseUntil(endpoint, onMessage) {
  const res = await fetch(endpoint, { method: 'GET', headers: { Accept: 'text/event-stream' } });
  if (!res.ok) throw new Error(`SSE connect failed: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let endpointPath = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const lines = chunk.split('\n');
      const typeLine = lines.find(l => l.startsWith('event:')) || '';
      const dataLines = lines.filter(l => l.startsWith('data:')).map(l => l.replace(/^data: ?/, '')).join('\n');
      const eventType = typeLine.replace(/^event: ?/, '').trim();
      if (eventType === 'endpoint') {
        endpointPath = dataLines.trim();
        onMessage({ type: 'endpoint', data: endpointPath });
      } else if (eventType === 'message') {
        try { onMessage({ type: 'message', data: JSON.parse(dataLines) }); } catch {}
      }
    }
    if (endpointPath) return { endpointPath, close: () => res.body.cancel() };
  }
}

async function postMessage(url, message) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(message) });
  if (r.status !== 202) throw new Error(`POST ${url} -> ${r.status}`);
}

(async () => {
  const base = process.argv[2] || process.env.MCP_URL || (() => {
    try { return fs.readFileSync('logs/ngrok_url.txt', 'utf8').trim(); } catch { return 'http://localhost:3000'; }
  })();

  console.log(`Connecting to ${base}/mcp ...`);
  const { endpointPath } = await readSseUntil(`${base}/mcp`, (evt) => {
    if (evt.type === 'message') console.log('<=', JSON.stringify(evt.data));
    if (evt.type === 'endpoint') console.log('endpoint:', evt.data);
  });

  const postUrl = new URL(endpointPath, base).toString();
  console.log('POST URL:', postUrl);
  await postMessage(postUrl, { jsonrpc: '2.0', id: 1, method: 'resources/list', params: {} });
  await new Promise(r => setTimeout(r, 500));
  // Emulate mobile "kampanya getir" → campaigns summary
  await postMessage(postUrl, { jsonrpc: '2.0', id: 2, method: 'resources/read', params: { uri: 'enpara://campaigns/summary' } });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Done (campaigns/summary requested).');
})().catch(e => { console.error('Test failed:', e); process.exit(1); });


