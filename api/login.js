const crypto = require('crypto');
const { setSessionCookie } = require('../lib/session');
const { readJsonBody } = require('../lib/readBody');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: 'ADMIN_PASSWORD is not configured on the server.' });
    return;
  }

  const { password } = await readJsonBody(req);
  if (typeof password !== 'string' || !safeEqual(password, adminPassword)) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  setSessionCookie(res);
  res.status(200).json({ ok: true });
};
