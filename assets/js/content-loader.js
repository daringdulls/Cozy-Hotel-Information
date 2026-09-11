/* Fetches live content from /api/content and overlays it onto the page.
   Every value already exists in the static HTML as a sensible default, so
   if the API is unreachable (e.g. plain static hosting, offline, DB not
   yet connected) the page still reads correctly — this only upgrades it. */
(function () {
  var sitePhones;
  var PHONE_PLACEHOLDERS = {
    hotel: '9607721818',
    diving: '9607909494',
    restaurant: '9607873535'
  };

  function digits(v) {
    return String(v || '').replace(/[^\d]/g, '');
  }

  function fetchJson(url) {
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function applyPhones(phones) {
    if (!phones) return;
    var map = {};
    Object.keys(PHONE_PLACEHOLDERS).forEach(function (key) {
      var newDigits = digits(phones[key]);
      if (newDigits) map[PHONE_PLACEHOLDERS[key]] = newDigits;
    });
    if (!Object.keys(map).length) return;

    document.querySelectorAll('a[href^="tel:+"], a[href^="https://wa.me/"]').forEach(function (a) {
      var href = a.getAttribute('href');
      Object.keys(map).forEach(function (oldNum) {
        if (href.indexOf(oldNum) !== -1) {
          href = href.split(oldNum).join(map[oldNum]);
        }
      });
      a.setAttribute('href', href);
    });

    // Visible "+960 xxx xxxx" text in the Important Information panel.
    document.querySelectorAll('[data-phone-display]').forEach(function (el) {
      var key = el.getAttribute('data-phone-display');
      if (phones[key]) el.textContent = formatPhone(phones[key]);
    });
  }

  function formatPhone(raw) {
    var d = digits(raw);
    if (d.length !== 10 || d.slice(0, 3) !== '960') return raw;
    return '+960 ' + d.slice(3, 6) + ' ' + d.slice(6);
  }

  function applyInstagram(url) {
    if (!safeUrl(url)) return;
    document.querySelectorAll('a[aria-label="Instagram"]').forEach(function (a) {
      a.setAttribute('href', url);
    });
  }

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
  }

  function applyFields(data) {
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var value = get(data, el.getAttribute('data-field'));
      if (value === undefined || value === null) return;
      el.textContent = value;
    });
  }

  function applyMenuLink(url) {
    var el = document.getElementById('menu-link');
    if (el) {
      el.setAttribute('href', safeUrl(url) ? url : 'https://wa.me/9607873535?text=Hello%2C%20could%20you%20share%20the%20restaurant%20menu%3F');
      if (!safeUrl(url)) el.textContent = 'Ask for the menu';
    }
  }

  function safeUrl(url, image) {
    if (typeof url !== 'string') return false;
    if (image && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) return true;
    try { return ['https:', 'http:'].includes(new URL(url).protocol); } catch (_) { return false; }
  }

  function applyPhotos(photos) {
    if (!photos) return;
    document.querySelectorAll('img[data-photo]').forEach(function (el) {
      var url = photos[el.dataset.photo] || photos[el.dataset.fallbackPhoto];
      if (safeUrl(url, true)) el.src = url;
    });
    var map = { hero: 'hero-section', about: 'ph-about', dining: 'ph-dining', transfers: 'ph-transfers' };
    Object.keys(map).forEach(function (key) {
      var url = photos[key];
      if (!safeUrl(url, true)) return;
      var el = document.getElementById(map[key]);
      if (!el) return;
      if (key === 'hero') {
        el.style.setProperty('--hero-img', 'url(' + JSON.stringify(url).slice(1, -1) + ')');
      } else {
        el.style.backgroundImage = 'url(' + JSON.stringify(url).slice(1, -1) + ')';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    });
  }

  function init() {
    applyMenuLink('');
    fetchJson('/api/content?scope=site').then(function (res) {
      if (res && res.data) {
        sitePhones = res.data.phones;
        applyPhones(res.data.phones);
        applyInstagram(res.data.instagram);
      }
    });

    var property = document.body.getAttribute('data-property');
    var propertyKeys = new Set(Array.from(document.querySelectorAll('[data-property-photo]')).map(function (el) { return el.dataset.propertyPhoto; }));
    propertyKeys.forEach(function (slug) {
      fetchJson('/api/content?scope=' + encodeURIComponent(slug)).then(function (res) {
        if (!res || !res.data || !res.data.photos) return;
        var url = res.data.photos.about;
        if (safeUrl(url, true)) document.querySelectorAll('[data-property-photo="' + slug + '"]').forEach(function (el) { el.src = url; });
      });
    });
    if (!property) return;

    fetchJson('/api/content?scope=' + encodeURIComponent(property)).then(function (res) {
      if (!res || !res.data) return;
      applyFields(res.data);
      applyMenuLink(res.data.menuUrl);
      if (sitePhones) applyPhones(sitePhones);
      applyPhotos(res.data.photos);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
