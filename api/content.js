const { getContent, setContent, isValidScope, VALID_SCOPES, hasDatabase } = require('../lib/db');
const { isAuthenticated } = require('../lib/session');
const { readJsonBody } = require('../lib/readBody');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const scope = (req.query && req.query.scope) || '';
    if (!isValidScope(scope)) {
      res.status(400).json({ error: 'scope must be one of: ' + VALID_SCOPES.join(', ') });
      return;
    }
    try {
      const { data, updatedAt, source } = await getContent(scope);
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ scope, data, updatedAt, source, hasDatabase: hasDatabase() });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load content: ' + err.message });
    }
    return;
  }

  if (req.method === 'PUT') {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Not signed in.' });
      return;
    }
    const body = await readJsonBody(req);
    const { scope, data } = body || {};
    if (!isValidScope(scope)) {
      res.status(400).json({ error: 'scope must be one of: ' + VALID_SCOPES.join(', ') });
      return;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      res.status(400).json({ error: 'data must be an object.' });
      return;
    }
    try {
      await setContent(scope, data);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
