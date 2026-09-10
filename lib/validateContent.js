function validUrl(value, image) {
  if (value === '') return true;
  if (image && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return value.length <= 420000;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
function validateContent(data) {
  if (Buffer.byteLength(JSON.stringify(data)) > 3500000) return 'The images are too large. Use smaller photos.';
  function visit(obj, depth, prefix) {
    if (depth > 4) return 'Content is nested too deeply.';
    for (const [key, value] of Object.entries(obj)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) return 'Invalid field name.';
      const path = prefix ? prefix + '.' + key : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) { const error = visit(value, depth + 1, path); if (error) return error; }
      else if (typeof value !== 'string') return 'All content fields must contain text.';
      else if (path.startsWith('photos.')) { if (!validUrl(value, true)) return 'Photos must be an HTTP(S) image URL or an uploaded JPG, PNG or WebP image under 300 KB.'; }
      else if (path === 'menuUrl' || path === 'instagram') { if (!validUrl(value, false)) return 'Links must start with https:// or http://.'; }
      else if (value.length > 12000) return 'A text field is too long (maximum 12,000 characters).';
    }
    return null;
  }
  return visit(data, 0, '');
}
module.exports = { validateContent };
