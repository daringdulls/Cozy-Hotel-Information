/* Fetches live content from /api/content and overlays it onto the page.
   Every value already exists in the static HTML as a sensible default, so
   if the API is unreachable (e.g. plain static hosting, offline, DB not
   yet connected) the page still reads correctly — this only upgrades it. */
(function () {
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
    if (!url) return;
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
      if (value === undefined || value === null || value === '') return;
      el.textContent = value;
    });
  }

  function applyMenuLink(url) {
    if (!url) return;
    var el = document.getElementById('menu-link');
    if (el) el.setAttribute('href', url);
  }

  function applyPhotos(photos) {
    if (!photos) return;
    var map = { hero: 'hero-section', about: 'ph-about', dining: 'ph-dining', transfers: 'ph-transfers' };
    Object.keys(map).forEach(function (key) {
      var url = photos[key];
      if (!url) return;
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
    fetchJson('/api/content?scope=site').then(function (res) {
      if (res && res.data) {
        applyPhones(res.data.phones);
        applyInstagram(res.data.instagram);
      }
    });

    var property = document.body.getAttribute('data-property');
    if (!property) return;

    fetchJson('/api/content?scope=' + encodeURIComponent(property)).then(function (res) {
      if (!res || !res.data) return;
      applyFields(res.data);
      applyMenuLink(res.data.menuUrl);
      applyPhotos(res.data.photos);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
