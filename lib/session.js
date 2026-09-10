// Minimal signed-cookie session, no external auth dependency.
// A session value is `<expiryEpochMs>.<hmacHex>`; the HMAC covers the
// expiry using SESSION_SECRET, so a token can't be forged or extended
// without the secret, and expired tokens are rejected on read.
const crypto = require('crypto');

const COOKIE_NAME = 'cozy_admin';
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.VERCEL) {
    throw new Error('SESSION_SECRET environment variable is not set.');
  }
  // Local-dev-only fallback so `vercel dev` works without extra setup.
  return 'local-dev-secret-do-not-use-in-production';
}

function sign(expiry) {
  return crypto.createHmac('sha256', getSecret()).update(String(expiry)).digest('hex');
}

function createToken() {
  const expiry = Date.now() + SESSION_MS;
  return `${expiry}.${sign(expiry)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expiryStr, mac] = token.split('.');
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;
  const expected = sign(expiry);
  const a = Buffer.from(mac, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifyToken(cookies[COOKIE_NAME]);
}

function setSessionCookie(res) {
  const token = createToken();
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_MS / 1000)}${secure}`
  );
}

function clearSessionCookie(res) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

module.exports = { isAuthenticated, setSessionCookie, clearSessionCookie };
