// Content storage: Postgres in production (Vercel Postgres / any POSTGRES_URL),
// falling back to the bundled JSON seed files in data/content/ whenever the
// database is unset or a scope hasn't been saved yet. This means the guest
// pages always have something to show, database or not.
const fs = require('fs');
const path = require('path');

const VALID_SCOPES = ['site', 'cozy-nest', 'cozy-roots', 'cozy-arts'];

function seedPath(scope) {
  return path.join(process.cwd(), 'data', 'content', `${scope}.json`);
}

function readSeed(scope) {
  const raw = fs.readFileSync(seedPath(scope), 'utf-8');
  return JSON.parse(raw);
}

let sqlClient = null;
let tableReady = null;

function connectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

function hasDatabase() {
  return Boolean(connectionString());
}

async function getSql() {
  if (!hasDatabase()) return null;
  if (!sqlClient) {
    // Lazy require so the dependency is only needed when a DB is configured.
    const { neon } = require('@neondatabase/serverless');
    sqlClient = neon(connectionString());
  }
  if (!tableReady) {
    tableReady = sqlClient`
      CREATE TABLE IF NOT EXISTS content (
        scope TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  await tableReady;
  return sqlClient;
}

function isValidScope(scope) {
  return VALID_SCOPES.includes(scope);
}

async function getStoredContent(scope) {
  if (!isValidScope(scope)) throw new Error('Unknown scope: ' + scope);
  const sql = await getSql();
  if (sql) {
    const rows = await sql`SELECT data, updated_at FROM content WHERE scope = ${scope}`;
    if (rows.length) {
      return { data: mergeContent(readSeed(scope), rows[0].data), updatedAt: rows[0].updated_at, source: 'database' };
    }
  }
  return { data: readSeed(scope), updatedAt: null, source: 'seed' };
}

async function getContent(scope) {
  const result = await getStoredContent(scope);
  if (scope === 'cozy-roots') {
    const nest = await getStoredContent('cozy-nest');
    const description = 'Cozy Roots guests enjoy their meals at Cozy Deck Restaurant, shared with Cozy Nest.';
    result.data.dining = { ...nest.data.dining, title: 'Cozy Deck Restaurant', description };
    result.data.menuUrl = nest.data.menuUrl;
    result.data.photos.dining = nest.data.photos.dining;
    result.data.details.dining_1 = description;
    result.data.details.facilities_4 = 'Meals at Cozy Deck Restaurant, shared with Cozy Nest';
  }
  if (scope === 'cozy-nest' && result.data.gallery) {
    const old=['Your island stay','Rooms & spaces','Dining at Cozy Nest','Underwater adventures'];
    const labels=['In-room amenities','Bathroom & bathtub','Cozy Deck exterior','Guest room'];
    old.forEach((value,i)=>{const key='caption'+(i+1);if(result.data.gallery[key]===value)result.data.gallery[key]=labels[i];});
  }
  if (scope === 'cozy-arts') {
    function rename(value) { if(typeof value === 'string') return value.replace(/Cozy Arts/g, 'Cozy Art').replace(/COZY ARTS/g, 'COZY ART'); if(value && typeof value === 'object') for(const key of Object.keys(value)) value[key]=rename(value[key]); return value; }
    result.data=rename(result.data);
  }
  if (scope === 'cozy-arts' && result.data.intro) {
    result.data.intro.welcome = result.data.intro.welcome.replace(/dining times,\s*/gi, '');
  }
  if (['cozy-nest','cozy-roots'].includes(scope) && !result.data.menuUrl) result.data.menuUrl = 'https://cozydeck.pixelatemv.com/menu';
  return result;
}

async function setContent(scope, data) {
  if (!isValidScope(scope)) throw new Error('Unknown scope: ' + scope);
  const sql = await getSql();
  if (sql) {
    await sql`
      INSERT INTO content (scope, data, updated_at)
      VALUES (${scope}, ${JSON.stringify(data)}::jsonb, now())
      ON CONFLICT (scope) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    return true;
  }
  // No database configured. Allow local-dev convenience writes to the seed
  // file, but never on Vercel's read-only production filesystem.
  if (process.env.VERCEL) {
    throw new Error(
      'No database connected. Add the Vercel Postgres integration and redeploy before saving changes.'
    );
  }
  fs.writeFileSync(seedPath(scope), JSON.stringify(data, null, 2) + '\n', 'utf-8');
  return true;
}

function mergeContent(base, saved) {
  const result = { ...base };
  for (const [key, value] of Object.entries(saved || {})) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
    result[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? mergeContent(base[key] || {}, value) : value;
  }
  return result;
}

module.exports = { getContent, setContent, isValidScope, VALID_SCOPES, hasDatabase, mergeContent };
