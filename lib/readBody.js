// Vercel's Node runtime usually pre-parses JSON into req.body, but guard
// with a manual stream read so this also works under `vercel dev` and any
// runtime that leaves the body unparsed.
async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

module.exports = { readJsonBody };
